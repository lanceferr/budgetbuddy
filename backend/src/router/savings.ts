import express from 'express';
import { addSavingsGoal, listSavingsGoals, listSavingsGoalById, updateSavingsGoal, deleteSavingsGoal} from  '../controllers/savings.ts';
import { isAuthenticated } from '../middlewares/index.ts';  

export default (router: express.Router) => {
    router.get('/savings-goals', isAuthenticated, listSavingsGoals);
    router.post('/savings-goals', isAuthenticated, addSavingsGoal);
    router.get('/savings-goals/:id', isAuthenticated, listSavingsGoalById);
    router.patch('/savings-goals/:id', isAuthenticated, updateSavingsGoal);
    router.delete('/savings-goals/:id', isAuthenticated, deleteSavingsGoal);
};