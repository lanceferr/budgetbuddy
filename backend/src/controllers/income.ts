import express from 'express';
import _ from 'lodash';
import { createIncome, getIncomeByUser, getIncomeById, updateIncomeById, deleteIncomeById } from '../db/income.ts';

export const createNewIncome = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

    const { amount, date, source, notes } = req.body;

    if (amount === undefined || amount === null)
      return res.status(400).json({ error: 'Amount is required' });

    if (isNaN(Number(amount)) || Number(amount) <= 0)
      return res.status(400).json({ error: 'Amount must be a positive number' });

    if (!source || source.trim() === '')
      return res.status(400).json({ error: 'Source is required' });

    const income = await createIncome({
      userId: currentUserId,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      source: source.trim(),
      notes: (notes || '').trim(),
    });

    return res.status(200).json({ message: 'Income created', income });
  } catch (error) {
    console.log('Error in createNewIncome:', error);
    return res.status(500).json({ error: 'Failed to create income. Please try again.' });
  }
};



/**
 * List all income entries for the authenticated user
 * Acceptance Criteria:
 *  - return all income entries
 *  - sortable in UI (sorting handled client-side or via query params)
 */
export const listIncomes = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

    const incomes = await getIncomeByUser(currentUserId);

    return res.status(200).json({ message: 'Incomes retrieved', incomes });
  } catch (error) {
    console.log('Error in listIncomes:', error);
    return res.status(500).json({ error: 'Retrieving incomes failed' });
  }
};

/**
 * Get a single income entry by ID
 * Ensures:
 * - income exists
 * - user owns it
 */
export const getSingleIncome = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

    const { incomeId } = req.params;
    if (!incomeId) return res.status(400).json({ error: 'Income ID is required' });

    const income = await getIncomeById(incomeId);
    if (!income) return res.status(404).json({ error: 'Income not found' });
    if (income.userId.toString() !== currentUserId.toString())
      return res.status(403).json({ error: 'Access denied' });

    return res.status(200).json({ message: 'Income retrieved', income });
  } catch (error) {
    console.log('Error in getSingleIncome:', error);
    return res.status(500).json({ error: 'Failed to retrieve income. Please try again.' });
  }
};


/*
 * Update income entry
 * Acceptance Criteria:
 * - amount still must be > 0
 * - editable: amount, date, source, notes
*/

export const updateIncome = async (req: express.Request, res: express.Response) => {
  // To be implemented
};

/**
 * Delete income entry
 * Must:
 * - confirm user owns the entry
 */
export const deleteIncome = async (req: express.Request, res: express.Response) => {
  // To be implemented
};