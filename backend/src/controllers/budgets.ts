import express from 'express';
import _ from 'lodash';
import { createBudget, getBudgetsByUser, getBudgetById, updateBudgetById, deleteBudgetById } from '../db/budgets.ts';
import { getTotalExpenses } from '../db/expenses.ts';

const getPeriodStart = (period: string) => {
  const now = new Date();
  if (period === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // weekly: compute Monday as start of week
  const day = now.getDay();
  const diff = (day + 6) % 7; // days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const createNewBudget = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

    const { amount, period, category } = req.body;

    if (amount === undefined || amount === null) return res.status(400).json({ error: 'Amount is required' });
    if (isNaN(Number(amount)) || Number(amount) <= 0) return res.status(400).json({ error: 'Amount must be a positive number' });
    if (!period || (period !== 'weekly' && period !== 'monthly')) return res.status(400).json({ error: 'Period must be "weekly" or "monthly"' });

    const budget = await createBudget({ userId: currentUserId, amount: Number(amount), period, category: (category || '').trim() });

    return res.status(200).json({ message: 'Budget created', budget });
  } catch (error) {
    console.log('Error in createNewBudget:', error);
    return res.status(500).json({ error: 'Failed to create budget. Please check your input and try again.' });
  }
};

export const listBudgets = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

    const budgets = await getBudgetsByUser(currentUserId);

    const budgetsWithSpent = await Promise.all(budgets.map(async (b: any) => {
      const startDate = getPeriodStart(b.period);
      const total = await getTotalExpenses(currentUserId, {
        category: b.category || undefined,
        startDate,
      });

      return {
        ...b,
        currentSpent: total,
      };
    }));

    return res.status(200).json({ message: 'Budgets retrieved', budgets: budgetsWithSpent });
  } catch (error) {
    console.log('Error in listBudgets:', error);
    return res.status(500).json({ error: 'Retrieving budgets failed' });
  }
};

export const getSingleBudget = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

    const { budgetId } = req.params;
    if (!budgetId) return res.status(400).json({ error: 'Budget ID is required' });

    const budget = await getBudgetById(budgetId);
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    if (budget.userId.toString() !== currentUserId.toString()) return res.status(403).json({ error: 'Access denied' });

    const startDate = getPeriodStart(budget.period);
    const total = await getTotalExpenses(currentUserId, { category: budget.category || undefined, startDate });

    return res.status(200).json({ message: 'Budget retrieved', budget: { ...budget, currentSpent: total } });
  } catch (error) {
    console.log('Error in getSingleBudget:', error);
    return res.status(500).json({ error: 'Failed to retrieve budget. Please try again.' });
  }
};

export const updateBudget = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

    const { budgetId } = req.params;
    const { amount, period, category } = req.body;

    if (!budgetId) return res.status(400).json({ error: 'Budget ID is required' });

    const existing = await getBudgetById(budgetId);
    if (!existing) return res.status(404).json({ error: 'Budget not found' });
    if (existing.userId.toString() !== currentUserId.toString()) return res.status(403).json({ error: 'Access denied' });

    const updates: any = {};
    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) <= 0) return res.status(400).json({ error: 'Amount must be a positive number' });
      updates.amount = Number(amount);
    }
    if (period !== undefined) {
      if (period !== 'weekly' && period !== 'monthly') return res.status(400).json({ error: 'Period must be "weekly" or "monthly"' });
      updates.period = period;
    }
    if (category !== undefined) updates.category = (category || '').trim();

    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });

    const updated = await updateBudgetById(budgetId, updates);

    return res.status(200).json({ message: 'Budget updated', budget: updated });
  } catch (error) {
    console.log('Error in updateBudget:', error);
    return res.status(500).json({ error: 'Failed to update budget. Please check your input and try again.' });
  }
};

export const deleteBudget = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

    const { budgetId } = req.params;
    if (!budgetId) return res.status(400).json({ error: 'Budget ID is required' });

    const existing = await getBudgetById(budgetId);
    if (!existing) return res.status(404).json({ error: 'Budget not found' });
    if (existing.userId.toString() !== currentUserId.toString()) return res.status(403).json({ error: 'Access denied' });

    await deleteBudgetById(budgetId);

    return res.status(200).json({ message: 'Budget deleted', budgetId });
  } catch (error) {
    console.log('Error in deleteBudget:', error);
    return res.status(500).json({ error: 'Failed to delete budget. Please try again.' });
  }
};