import express from 'express';

import { login, register, logout, loginWithShortExpiry, requestPasswordReset, resetPassword } from '../controllers/authentication.js';

export default (router: express.Router) => {
	router.post('/auth/register', register);
	router.post('/auth/login', login);
	router.post('/auth/logout', logout);
	
	// Password Reset
	router.post('/auth/request-reset', requestPasswordReset);
	router.post('/auth/reset-password', resetPassword);
	
	// TEST ENDPOINT: Login with 1-minute session expiry
	router.post('/auth/login-test', loginWithShortExpiry);
};