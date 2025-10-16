import express from 'express';
import authentication from './authentication.js';
import users from './users.js';
import expenses from './expenses.js'

const router = express.Router();

export default (): express.Router => {
	authentication(router);
	users(router);
	expenses(router);

	return router;
};