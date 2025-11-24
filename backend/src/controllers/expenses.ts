import express from 'express';
import _ from 'lodash';
import { createExpense, getExpensesByUser, getTotalExpenses, getExpenseById, updateExpenseById, deleteExpenseById, getSpendingByCategory} from '../db/expenses.ts'
import { getBudgetsByUser } from '../db/budgets.ts';

export const addExpense = async (req : express.Request, res : express.Response) => {
	try {

		const currentUserId = _.get(req, 'identity._id') as unknown as string;
		
		if (!currentUserId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}
		
		const { amount, name, category, notes, date } = req.body;

		if(!amount || !category || !name){
			return res.status(400).json({ error : "Amount, Name, and Category are required"});
		}

		if (isNaN(Number(amount)) || Number(amount) <= 0) {
		    return res.status(400).json({ error: "Amount must be a positive number" });
		}

		const expense = await createExpense({
			userId : currentUserId,
			amount, 
			name,
			category, 
			notes, 
			date  // defaults to today if not provided
		});

		return res.status(200).json({
	    	message : 'Expense creation successful',
	      	expense : {
	        	userId : expense.userId,
	        	amount : expense.amount,
	        	name : expense.name,
	        	category : expense.category,
	        	notes : expense.notes,
	        	date : expense.date
	      }
	    }).end();

	} catch(error){
		console.log('Error in addExpense:', error);
		return res.status(500).json({ error: 'Expense Creation failed' });
	}
}

export const getExpenses = async (req : express.Request, res : express.Response) => {
	try {

		const currentUserId = _.get(req, 'identity._id') as unknown as string;
		
		if (!currentUserId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}
		
		const { startDate, endDate, category, sort} = req.query;

		const options: any = {};

		if(category){

			options.category = decodeURIComponent(category as string).trim();
		}

		if(startDate){
			options.startDate = new Date(startDate as string);
		}

		if(endDate){
			options.endDate = new Date(endDate as string);
		}

		if(sort){
			options.sort = sort; //format should be {"amount":-1} no space
		}
		
		const expenses = await getExpensesByUser(currentUserId, options);

		const total = await getTotalExpenses(currentUserId, options);

		return res.status(200).json({ 
			message: "Expenses was retrieved",
			expenses,
			total,
		})

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Retrieving Expenses Failed!!' });
	}
}

export const getSingleExpense = async (req : express.Request, res : express.Response) => {
	try {
		const currentUserId = _.get(req, 'identity._id') as unknown as string;
		
		if (!currentUserId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const { expenseId } = req.params;

		if (!expenseId) {
			return res.status(400).json({ error: 'Expense ID is required' });
		}

		const expense = await getExpenseById(expenseId);

		if (!expense) {
			return res.status(404).json({ error: 'Expense not found' });
		}

		// this checks if the expense belongs to the current user
		if (expense.userId.toString() !== currentUserId.toString()) {
			return res.status(403).json({ error: 'Access denied: You can only view your own expenses' });
		}

		return res.status(200).json({ 
			message: "Expense retrieved successfully",
			expense
		});

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Failed to retrieve expense' });
	}
}

export const updateExpense = async (req : express.Request, res : express.Response) => {
	try {
		const currentUserId = _.get(req, 'identity._id') as unknown as string;
		
		if (!currentUserId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const { expenseId } = req.params;
		const { amount, name, category, notes, date } = req.body;

		if (!expenseId) {
			return res.status(400).json({ error: 'Expense ID is required' });
		}

		const existingExpense = await getExpenseById(expenseId);

		if (!existingExpense) {
			return res.status(404).json({ error: 'Expense not found' });
		}

		if (existingExpense.userId.toString() !== currentUserId.toString()) {
			return res.status(403).json({ error: 'Access denied: You can only update your own expenses' });
		}

		if (amount !== undefined) {
			if (isNaN(Number(amount)) || Number(amount) <= 0) {
				return res.status(400).json({ error: "Amount must be a positive number" });
			}
		}

		const updateData: Record<string, any> = {};
		if (amount !== undefined) updateData.amount = amount;
		if (name !== undefined) updateData.name = name;
		if (category !== undefined) updateData.category = category;
		if (notes !== undefined) updateData.notes = notes;
		if (date !== undefined) updateData.date = date;

		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ error: 'No fields to update' });
		}

		const updatedExpense = await updateExpenseById(expenseId, updateData);

		return res.status(200).json({
			message: 'Expense updated successfully',
			expense: updatedExpense
		});

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Failed to update expense' });
	}
}

export const deleteExpense = async (req : express.Request, res : express.Response) => {
	try {
		const currentUserId = _.get(req, 'identity._id') as unknown as string;
		
		if (!currentUserId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const { expenseId } = req.params;

		if (!expenseId) {
			return res.status(400).json({ error: 'Expense ID is required' });
		}

		const existingExpense = await getExpenseById(expenseId);

		if (!existingExpense) {
			return res.status(404).json({ error: 'Expense not found' });
		}

		if (existingExpense.userId.toString() !== currentUserId.toString()) {
			return res.status(403).json({ error: 'Access denied: You can only delete your own expenses' });
		}

		await deleteExpenseById(expenseId);

		return res.status(200).json({
			message: 'Expense deleted successfully',
			expenseId: expenseId
		});

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Failed to delete expense' });
	}
}

export const getDashboardStats = async (req : express.Request, res : express.Response) => {
	try {
		const currentUserId = _.get(req, 'identity._id') as unknown as string;
		if (!currentUserId) return res.status(401).json({ error: 'User not authenticated' });

		const now = new Date();
		const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		
		// Get spending by category for this month
		const categoryData = await getSpendingByCategory(currentUserId, thisMonthStart);

		// Get weekly trend (last 4 weeks)
		const weeks = [];
		for (let i = 3; i >= 0; i--) {
			const weekEnd = new Date(now);
			weekEnd.setDate(now.getDate() - (i * 7));
			const weekStart = new Date(weekEnd);
			weekStart.setDate(weekEnd.getDate() - 6);
			
			const total = await getTotalExpenses(currentUserId, { startDate: weekStart, endDate: weekEnd });
			weeks.push({ week: `Week ${4 - i}`, total, startDate: weekStart, endDate: weekEnd });
		}

		// Get budgets with current spending
		const budgets = await getBudgetsByUser(currentUserId);
		const budgetComparisons = await Promise.all(budgets.map(async (b: any) => {
			const periodStart = b.period === 'monthly' ? thisMonthStart : (() => {
				const day = now.getDay();
				const diff = (day + 6) % 7;
				const monday = new Date(now);
				monday.setDate(now.getDate() - diff);
				monday.setHours(0, 0, 0, 0);
				return monday;
			})();

			const spent = await getTotalExpenses(currentUserId, { 
				category: b.category || undefined, 
				startDate: periodStart 
			});

			return {
				category: b.category || 'Overall',
				budget: b.amount,
				spent,
				period: b.period
			};
		}));

		// Get top expenses this month
		const topExpenses = await getExpensesByUser(currentUserId, { startDate: thisMonthStart });
		const sorted = topExpenses.sort((a, b) => b.amount - a.amount).slice(0, 5);

		return res.status(200).json({
			message: 'Dashboard stats retrieved',
			stats: {
				categoryData,
				weeklyTrend: weeks,
				budgetComparisons,
				topExpenses: sorted
			}
		});

	} catch (error) {
		console.log('Error in getDashboardStats:', error);
		return res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
	}
}

