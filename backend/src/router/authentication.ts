import express from 'express';

import { login, register, logout, loginWithShortExpiry } from '../controllers/authentication.js';

export default (router: express.Router) => {
	router.post('/auth/register', register);
	router.post('/auth/login', login);
	router.post('/auth/logout', logout);
	
	// TEST ENDPOINT: Login with 1-minute session expiry
	router.post('/auth/login-test', loginWithShortExpiry);
};