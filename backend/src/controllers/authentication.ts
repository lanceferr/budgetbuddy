import express from 'express';
import { getUserByEmail, createUser, getUserByEmailWithAuth } from '../db/users.js'
import { random, authentication } from '../helpers/index.js'

// Email validation helper
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Password validation helper
const isValidPassword = (password: string): boolean => {
	// At least 8 characters, 1 uppercase, 1 lowercase, 1 number
	return password.length >= 8;
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

	} catch (error) {
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

		// Validate password strength
		if (!isValidPassword(password)) {
			return res.status(400).json({ error: 'Password must be at least 8 characters long' });
		}

		// Validate username length
		if (username.length < 3 || username.length > 30) {
			return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
		}

		const existingUser = await getUserByEmail(email);
		// check if user is existing
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

	} catch (error) {
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
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Logout failed' });
	}
};
