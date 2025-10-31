import express from 'express';
import authentication from './authentication.ts';
import users from './users.ts';
import expenses from './expenses.ts'

const router = express.Router();

export default (): express.Router => {
	authentication(router);
	users(router);
	expenses(router);

	return router;
};