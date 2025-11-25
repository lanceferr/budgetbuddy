import express from 'express';
import { isAuthenticated } from '../middlewares/index.ts';
import { createNewIncome, listIncomes, getSingleIncome } from '../controllers/income.ts';

export default (router: express.Router) => {
  router.post('/income', isAuthenticated, createNewIncome);
  router.get('/income', isAuthenticated, listIncomes);

  router.get('/income/:incomeId', isAuthenticated, getSingleIncome);

//   router.patch('/income/:incomeId', isAuthenticated, updateIncome);
//   router.delete('/budgets/:incomeId', isAuthenticated, deleteIncome);
};