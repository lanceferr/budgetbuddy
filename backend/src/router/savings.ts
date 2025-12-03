import express from 'express';
import { addSavingsGoal, listSavingsGoals, listSavingsGoalById, updateSavingsGoal, deleteSavingsGoal, addSavingsContribution} from  '../controllers/savings.ts';
import { isAuthenticated } from '../middlewares/index.ts';  

export default (router: express.Router) => {
    router.get('/savings-goals', isAuthenticated, listSavingsGoals);
    router.post('/savings-goals', isAuthenticated, addSavingsGoal);
    router.post('/savings-goals/:goalId/contribute', isAuthenticated, addSavingsContribution);
    router.get('/savings-goals/:goalId', isAuthenticated, listSavingsGoalById);
    router.patch('/savings-goals/:goalId', isAuthenticated, updateSavingsGoal);
    router.delete('/savings-goals/:goalId', isAuthenticated, deleteSavingsGoal);
};