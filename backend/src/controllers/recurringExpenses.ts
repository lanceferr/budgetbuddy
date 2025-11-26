import express from 'express';
import _ from 'lodash';
import { 
  createRecurringExpense, 
  getRecurringExpensesByUser, 
  getRecurringExpenseById, 
  updateRecurringExpenseById, 
  deleteRecurringExpenseById 
} from '../db/recurringExpenses.ts';
import { createExpense } from '../db/expenses.ts';

export const createRecurring = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { amount, name, category, frequency, startDate, endDate, notes, generateImmediately } = req.body;

    if (!amount || !name || !category || !frequency) {
      return res.status(400).json({ error: 'Amount, name, category, and frequency are required' });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    if (!['minutely', 'daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ error: 'Frequency must be minutely, daily, weekly, or monthly' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid start date' });
    }

    let end = null;
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid end date' });
      }
      if (end <= start) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    const recurringExpense = await createRecurringExpense({
      userId: currentUserId,
      amount: Number(amount),
      name,
      category,
      frequency,
      startDate: start,
      endDate: end,
      notes: notes || '',
      isActive: true,
    });

    if (generateImmediately === true) {
      const now = new Date();
      await createExpense({
        userId: currentUserId,
        amount: Number(amount),
        name,
        category,
        notes: notes || `Auto-generated from recurring expense (${frequency})`,
        date: now,
      });

      await updateRecurringExpenseById(recurringExpense._id.toString(), {
        lastGenerated: now,
      });

      return res.status(201).json({
        message: 'Recurring expense created and first expense generated successfully',
        recurringExpense,
        expenseGenerated: true,
      });
    }

    return res.status(201).json({
      message: 'Recurring expense created successfully',
      recurringExpense,
      expenseGenerated: false,
    });

  } catch (error) {
    console.log('Error in createRecurring:', error);
    return res.status(500).json({ error: 'Failed to create recurring expense' });
  }
};

export const getRecurringExpenses = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { includeInactive } = req.query;
    const showInactive = includeInactive === 'true';

    const recurringExpenses = await getRecurringExpensesByUser(currentUserId, showInactive);

    return res.status(200).json({
      message: 'Recurring expenses retrieved successfully',
      recurringExpenses,
    });

  } catch (error) {
    console.log('Error in getRecurringExpenses:', error);
    return res.status(500).json({ error: 'Failed to retrieve recurring expenses' });
  }
};

export const getSingleRecurringExpense = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { recurringId } = req.params;

    if (!recurringId) {
      return res.status(400).json({ error: 'Recurring expense ID is required' });
    }

    const recurringExpense = await getRecurringExpenseById(recurringId);

    if (!recurringExpense) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }

    if (recurringExpense.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Access denied: You can only view your own recurring expenses' });
    }

    return res.status(200).json({
      message: 'Recurring expense retrieved successfully',
      recurringExpense,
    });

  } catch (error) {
    console.log('Error in getSingleRecurringExpense:', error);
    return res.status(500).json({ error: 'Failed to retrieve recurring expense' });
  }
};

export const updateRecurringExpense = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { recurringId } = req.params;
    const { amount, name, category, frequency, startDate, endDate, notes, isActive } = req.body;

    if (!recurringId) {
      return res.status(400).json({ error: 'Recurring expense ID is required' });
    }

    const existingRecurring = await getRecurringExpenseById(recurringId);

    if (!existingRecurring) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }

    if (existingRecurring.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Access denied: You can only update your own recurring expenses' });
    }

    const updateData: Record<string, any> = {};

    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      updateData.amount = Number(amount);
    }

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    
    if (frequency !== undefined) {
      if (!['minutely', 'daily', 'weekly', 'monthly'].includes(frequency)) {
        return res.status(400).json({ error: 'Frequency must be minutely, daily, weekly, or monthly' });
      }
      updateData.frequency = frequency;
    }

    if (startDate !== undefined) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ error: 'Invalid start date' });
      }
      updateData.startDate = start;
    }

    if (endDate !== undefined) {
      if (endDate === null) {
        updateData.endDate = null;
      } else {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ error: 'Invalid end date' });
        }
        updateData.endDate = end;
      }
    }

    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedRecurring = await updateRecurringExpenseById(recurringId, updateData);

    return res.status(200).json({
      message: 'Recurring expense updated successfully',
      recurringExpense: updatedRecurring,
    });

  } catch (error) {
    console.log('Error in updateRecurringExpense:', error);
    return res.status(500).json({ error: 'Failed to update recurring expense' });
  }
};

export const deleteRecurringExpense = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { recurringId } = req.params;

    if (!recurringId) {
      return res.status(400).json({ error: 'Recurring expense ID is required' });
    }

    const existingRecurring = await getRecurringExpenseById(recurringId);

    if (!existingRecurring) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }

    if (existingRecurring.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Access denied: You can only delete your own recurring expenses' });
    }

    await deleteRecurringExpenseById(recurringId);

    return res.status(200).json({
      message: 'Recurring expense deleted successfully',
      recurringId,
    });

  } catch (error) {
    console.log('Error in deleteRecurringExpense:', error);
    return res.status(500).json({ error: 'Failed to delete recurring expense' });
  }
};

export const toggleRecurringExpenseActive = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = _.get(req, 'identity._id') as unknown as string;
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { recurringId } = req.params;

    if (!recurringId) {
      return res.status(400).json({ error: 'Recurring expense ID is required' });
    }

    const existingRecurring = await getRecurringExpenseById(recurringId);

    if (!existingRecurring) {
      return res.status(404).json({ error: 'Recurring expense not found' });
    }

    if (existingRecurring.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Access denied: You can only modify your own recurring expenses' });
    }

    const updatedRecurring = await updateRecurringExpenseById(recurringId, {
      isActive: !existingRecurring.isActive,
    });

    return res.status(200).json({
      message: `Recurring expense ${updatedRecurring?.isActive ? 'activated' : 'paused'}`,
      recurringExpense: updatedRecurring,
    });

  } catch (error) {
    console.log('Error in toggleRecurringExpenseActive:', error);
    return res.status(500).json({ error: 'Failed to toggle recurring expense status' });
  }
};