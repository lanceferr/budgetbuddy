import express from 'express';
import { isAuthenticated } from '../middlewares/index.ts'
import { addExpense, getExpenses, getSingleExpense, updateExpense, deleteExpense, getDashboardStats } from '../controllers/expenses.ts'

export default (router : express.Router) => {
	router.get('/dashboard/stats', isAuthenticated, getDashboardStats);
	
	router.post('/expenses', isAuthenticated, addExpense);
	router.get('/expenses', isAuthenticated, getExpenses);
	
	router.get('/expenses/:expenseId', isAuthenticated, getSingleExpense);
	router.patch('/expenses/:expenseId', isAuthenticated, updateExpense);
	router.delete('/expenses/:expenseId', isAuthenticated, deleteExpense);
};