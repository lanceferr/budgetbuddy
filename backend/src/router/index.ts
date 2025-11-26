import express from 'express';
import authentication from './authentication.ts';
import users from './users.ts';
import expenses from './expenses.ts'
import budgets from './budgets.ts';
import recurringExpenses from './recurringExpenses.ts';
import income from './income.ts';

const router = express.Router();

export default (): express.Router => {
	authentication(router);
	users(router);
	expenses(router);
	budgets(router);
	recurringExpenses(router);
	income(router);

	return router;
};