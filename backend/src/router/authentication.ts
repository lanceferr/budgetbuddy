import express from 'express';

import { login, register, logout, loginWithShortExpiry, requestPasswordReset, resetPassword } from '../controllers/authentication.ts';

export default (router: express.Router) => {
	router.post('/auth/register', register);
	router.post('/auth/login', login);
	router.post('/auth/logout', logout);
	
	router.post('/auth/request-reset', requestPasswordReset);
	router.post('/auth/reset-password', resetPassword);
	
	router.post('/auth/login-test', loginWithShortExpiry);
};