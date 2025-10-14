import express from 'express';
import { getUserByEmail, createUser, getUserByEmailWithAuth } from '../db/users.js'
import { random, authentication } from '../helpers/index.js'

// Email validation helper
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Enhanced password validation with detailed errors (Industry Standard)
const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];
	
	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}
	
	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}
	
	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}
	
	if (!/[0-9]/.test(password)) {
		errors.push('Password must contain at least one number');
	}
	
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
	}
	
	return {
		isValid: errors.length === 0,
		errors
	};
};

export const login = async (req : express.Request, res: express.Response) => {

	try {

		const { email, password} = req.body;

		// check if fields are empty
		if(!email || !password){
			return res.status(400).json({ error: 'Email and password are required' });
		}

		const user = await getUserByEmailWithAuth(email);

		// check if user does exist
		if(!user || !user.authentication){
			return res.status(400).json({ error: 'Invalid credentials' });
		}

		const expectedHash = authentication(user.authentication.salt, password);

		if (user.authentication.password != expectedHash){
			return res.status(403).json({ error: 'Invalid credentials' });
		}

		const salt = random();
		user.authentication.sessionToken = authentication(salt, user._id.toString());
		
		// Set session expiry to 7 days from now
		const sessionExpiry = new Date();
		sessionExpiry.setDate(sessionExpiry.getDate() + 7);
		user.authentication.sessionExpiry = sessionExpiry;

		await user.save();

		res.cookie('AUTH', user.authentication.sessionToken, {

			domain: 'localhost', 
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days

		});

		return res.status(200).json({
			message: 'Login successful',
			user: {
				id: user._id,
				email: user.email,
				username: user.username
			}

		}).end();

	} catch(error) {

		console.log(error);
		return res.status(500).json({ error: 'Login failed' });
	}

}

export const register = async (req : express.Request, res: express.Response) => {

	try {

		const { email, username, password} = req.body;

		// check if fields are empty
		if (!email || !password || !username){
			return res.status(400).json({ error: 'Email, username, and password are required' });
		}

		// Validate email format
		if (!isValidEmail(email)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}

		// Validate password strength with detailed errors
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.isValid) {
			return res.status(400).json({ 
				error: 'Password does not meet requirements',
				details: passwordValidation.errors
			});
		}

		// Validate username length
		if (username.length < 3 || username.length > 30) {
			return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
		}

		const existingUser = await getUserByEmail(email);
		// checks if user is exists!!
		if(existingUser) {
			return res.status(400).json({ error: 'User already exists' });
		}

		const salt = random();

		const user = await createUser({

			email,
			username,
			authentication: {
				salt,
				password: authentication(salt, password)
			},

		})
		
		return res.status(201).json({

			message: 'Registration successful',
			user: {
				id: user._id,
				email: user.email,
				username: user.username
			}

		}).end();

	} catch(error) {

		console.log(error)
		return res.status(500).json({ error: 'Registration failed' });

	}

}

export const logout = async (req: express.Request, res: express.Response) => {

	try {

		res.clearCookie('AUTH', {
			domain: 'localhost',
			path: '/'
		});

		return res.status(200).json({ message: 'Logout successful' });

	} catch(error) {

		console.log(error);
		return res.status(500).json({ error: 'Logout failed' });

	}

};

// TEST ENDPOINT: Login with short expiry (1 minute) - for testing session expiration
export const loginWithShortExpiry = async (req: express.Request, res: express.Response) => {

	try {
		
		const { email, password } = req.body;

		// check if fields are empty
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		const user = await getUserByEmailWithAuth(email);

		// check if user does exist
		if (!user || !user.authentication) {
			return res.status(400).json({ error: 'Invalid credentials' });
		}

		const expectedHash = authentication(user.authentication.salt, password);

		if (user.authentication.password != expectedHash) {
			return res.status(403).json({ error: 'Invalid credentials' });
		}

		const salt = random();
		user.authentication.sessionToken = authentication(salt, user._id.toString());
		
		// Set session expiry to 1 MINUTE from now (for testing)
		const sessionExpiry = new Date();
		sessionExpiry.setMinutes(sessionExpiry.getMinutes() + 1);
		user.authentication.sessionExpiry = sessionExpiry;

		await user.save();

		res.cookie('AUTH', user.authentication.sessionToken, {
			domain: 'localhost', 
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 1 * 60 * 1000 // 1 minute
		});

		return res.status(200).json({
			message: 'Login successful (session expires in 1 minute for testing)',
			sessionExpiresAt: sessionExpiry,
			user: {
				id: user._id,
				email: user.email,
				username: user.username
			}
		}).end();

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Login failed' });
	}

};