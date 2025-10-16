import express from 'express';
import { isAuthenticated } from '../middlewares/index.js'
import { addExpense, getExpenses, getSingleExpense, updateExpense, deleteExpense } from '../controllers/expenses.js'

export default (router : express.Router) => {
	router.post('/expenses', isAuthenticated, addExpense);
	router.get('/expenses', isAuthenticated, getExpenses);
	
	router.get('/expenses/:expenseId', isAuthenticated, getSingleExpense);
	router.patch('/expenses/:expenseId', isAuthenticated, updateExpense);
	router.delete('/expenses/:expenseId', isAuthenticated, deleteExpense);
};