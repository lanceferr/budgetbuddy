import express from 'express';
import { getUserByEmail, createUser, getUserByEmailWithAuth, setResetToken, getUserByResetToken, clearResetToken, updateUserById } from '../db/users.ts'
import { random, authentication } from '../helpers/index.ts'

const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

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

		if(!email || !password){
			return res.status(400).json({ error: 'Email and password are required' });
		}

		if(typeof email !== 'string' || typeof password !== 'string'){
			return res.status(400).json({ error: 'Invalid credentials' });
		}

		const user = await getUserByEmailWithAuth(email);

		if(!user || !user.authentication){
			return res.status(400).json({ error: 'Invalid credentials' });
		}

		const expectedHash = authentication(user.authentication.salt, password);

		if (user.authentication.password != expectedHash){
			return res.status(403).json({ error: 'Invalid credentials' });
		}

		const salt = random();
		user.authentication.sessionToken = authentication(salt, user._id.toString());
		
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

		if (!email || !password || !username){
			return res.status(400).json({ error: 'Email, username, and password are required' });
		}

		if (!isValidEmail(email)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}

		const passwordValidation = validatePassword(password);
		if (!passwordValidation.isValid) {
			return res.status(400).json({ 
				error: 'Password does not meet requirements',
				details: passwordValidation.errors
			});
		}

		if (username.length < 3 || username.length > 30) {
			return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
		}

		const existingUser = await getUserByEmail(email);
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
		
		const sessionSalt = random();
		const sessionToken = authentication(sessionSalt, user._id.toString());
		
		const sessionExpiry = new Date();
		sessionExpiry.setDate(sessionExpiry.getDate() + 7);

		await updateUserById(user._id.toString(), {
			'authentication.sessionToken': sessionToken,
			'authentication.sessionExpiry': sessionExpiry
		});

		res.cookie('AUTH', sessionToken, {
			domain: 'localhost', 
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		});
		
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

export const getCurrentUser = async (req: express.Request, res: express.Response) => {
	try {
		// The user is already attached by isAuthenticated middleware
		const user = (req as any).identity;
		
		if (!user) {
			return res.status(401).json({ error: 'Not authenticated' });
		}

		return res.status(200).json({
			user: {
				id: user._id,
				email: user.email,
				username: user.username
			}
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Failed to get current user' });
	}
};

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

export const loginWithShortExpiry = async (req: express.Request, res: express.Response) => {

	try {
		
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		const user = await getUserByEmailWithAuth(email);

		if (!user || !user.authentication) {
			return res.status(400).json({ error: 'Invalid credentials' });
		}

		const expectedHash = authentication(user.authentication.salt, password);

		if (user.authentication.password != expectedHash) {
			return res.status(403).json({ error: 'Invalid credentials' });
		}

		const salt = random();
		user.authentication.sessionToken = authentication(salt, user._id.toString());
		
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

export const requestPasswordReset = async (req: express.Request, res: express.Response) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ error: 'Email is required' });
		}

		if (!isValidEmail(email)) {
			return res.status(400).json({ error: 'Please provide a valid email address' });
		}

		const user = await getUserByEmail(email);

		if (!user) {
			console.log(`Password reset requested for non-existent email: ${email}`);
			return res.status(200).json({ 
				message: 'If an account exists with this email, a password reset link has been sent'
			});
		}

		const resetToken = random(32);

		const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

		await setResetToken(email, resetToken, resetExpiry);

		console.log(`Password reset token for ${email}: ${resetToken}`);
		console.log(`Token expires at: ${resetExpiry.toISOString()}`);

		return res.status(200).json({ 
			message: 'If an account exists with this email, a password reset link has been sent',
			// REMOVE THIS IN THE FUTURE - only for testing without email
			debug: {
				resetToken,
				expiresAt: resetExpiry.toISOString()
			}
		});

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Failed to process password reset request' });
	}
};

export const resetPassword = async (req: express.Request, res: express.Response) => {
	try {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return res.status(400).json({ error: 'Reset token and new password are required' });
		}

		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.isValid) {
			return res.status(400).json({ 
				error: 'Password does not meet requirements',
				details: passwordValidation.errors
			});
		}

		const user = await getUserByResetToken(token);

		if (!user) {
			return res.status(400).json({ 
				error: 'Invalid or expired reset token. Please request a new password reset.'
			});
		}

		const salt = random();
		const hashedPassword = authentication(salt, newPassword);

		await updateUserById(user._id.toString(), {
			'authentication.password': hashedPassword,
			'authentication.salt': salt,
			'authentication.sessionToken': undefined,
			'authentication.sessionExpiry': undefined
		});

		await clearResetToken(user._id.toString());

		console.log(`Password successfully reset for user: ${user.email}`);

		return res.status(200).json({ 
			message: 'Password has been successfully reset. You can now login with your new password.'
		});

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Failed to reset password' });
	}
};