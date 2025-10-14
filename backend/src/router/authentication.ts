import express from 'express';

import { login, register, logout } from '../controllers/authentication.js';

export default (router: express.Router) => {
	router.post('/auth/register', register);
	router.post('/auth/login', login);
	router.post('/auth/logout', logout);
};