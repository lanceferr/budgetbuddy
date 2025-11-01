import express from 'express';

import { login, register, logout, loginWithShortExpiry, requestPasswordReset, resetPassword, getCurrentUser } from '../controllers/authentication.ts';
import { isAuthenticated } from '../middlewares/index.ts';

export default (router: express.Router) => {
	router.post('/auth/register', register);
	router.post('/auth/login', login);
	router.post('/auth/logout', logout);
	router.get('/auth/me', isAuthenticated, getCurrentUser); // Get current authenticated user
	
	router.post('/auth/request-reset', requestPasswordReset);
	router.post('/auth/reset-password', resetPassword);
	
	router.post('/auth/login-test', loginWithShortExpiry);
};