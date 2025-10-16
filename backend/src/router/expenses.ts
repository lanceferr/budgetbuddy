import express from 'express';
import { isAuthenticated } from '../middlewares/index.js'
import { addExpense, getExpenses } from '../controllers/expenses.js'

export default (router : express.Router) => {
	// No :id parameter needed - uses session user ID
	router.post('/expenses', isAuthenticated, addExpense);
	router.get('/expenses', isAuthenticated, getExpenses);
};