import express from 'express';
import { isAuthenticated } from '../middlewares/index.ts';
import { createNewBudget, listBudgets, getSingleBudget, updateBudget, deleteBudget } from '../controllers/budgets.ts';

export default (router: express.Router) => {
  router.post('/budgets', isAuthenticated, createNewBudget);
  router.get('/budgets', isAuthenticated, listBudgets);

  router.get('/budgets/:budgetId', isAuthenticated, getSingleBudget);
  router.patch('/budgets/:budgetId', isAuthenticated, updateBudget);
  router.delete('/budgets/:budgetId', isAuthenticated, deleteBudget);
};