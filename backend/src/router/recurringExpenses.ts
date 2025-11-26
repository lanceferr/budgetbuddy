import express from 'express';
import { isAuthenticated } from '../middlewares/index.ts';
import { 
  createRecurring, 
  getRecurringExpenses, 
  getSingleRecurringExpense, 
  updateRecurringExpense, 
  deleteRecurringExpense,
  toggleRecurringExpenseActive
} from '../controllers/recurringExpenses.ts';

export default (router: express.Router) => {
  // Create a new recurring expense
  router.post('/recurring-expenses', isAuthenticated, createRecurring);
  
  // Get all recurring expenses for the authenticated user
  router.get('/recurring-expenses', isAuthenticated, getRecurringExpenses);
  
  // Get a single recurring expense by ID
  router.get('/recurring-expenses/:recurringId', isAuthenticated, getSingleRecurringExpense);
  
  // Update a recurring expense
  router.patch('/recurring-expenses/:recurringId', isAuthenticated, updateRecurringExpense);
  
  // Delete a recurring expense
  router.delete('/recurring-expenses/:recurringId', isAuthenticated, deleteRecurringExpense);
  
  // Toggle active status (pause/resume)
  router.post('/recurring-expenses/:recurringId/toggle', isAuthenticated, toggleRecurringExpenseActive);
};
