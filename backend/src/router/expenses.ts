import express from 'express';
import { isAuthenticated, isOwner } from '../middlewares/index.js'
import { addExpense, getExpenses } from '../controllers/expenses.js'

export default (router : express.Router) => {
	router.post('/expenses/:id', isAuthenticated, isOwner, addExpense);
	router.get('/expenses/:id', isAuthenticated, isOwner, getExpenses)
};