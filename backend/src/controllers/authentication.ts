import express from 'express';
import { getUserByEmail, createUser, getUserByEmailWithAuth } from '../db/users.ts'
import { random, authentication } from '../helpers/index.ts'

export const login = async (req : express.Request, res: express.Response) => {
	try {
		const { email, password} = req.body;

		// check if fields are empty
		if(!email || !password){
			return res.sendStatus(400);
		}

		const user = await getUserByEmailWithAuth(email);

		// check if user does exist
		if(!user){
			return res.sendStatus(400)
		}

		const expectedHash = authentication(user.authentication.salt, password);

		if (user.authentication.password != expectedHash){
			return res.sendStatus(403);
		}

		const salt = random();
		user.authentication.sessionToken = authentication(salt, user._id.toString());

		await user.save();

		res.cookie('AUTH', user.authentication.sessionToken, {domain: 'localhost', path: "/"});

		return res.status(200).json(user).end();

	} catch (error) {
		console.log(error);
		return res.sendStatus(400);
	}
}

export const register = async (req : express.Request, res: express.Response) => {
	try {
		const { email, username, password} = req.body;

		// check if fields are empty
		if (!email || !password || !username){
			return res.sendStatus(400);
		}

		const existingUser = await getUserByEmail(email);
		// check if user is existing
		if(existingUser) {
			return res.sendStatus(400);
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
		return res.status(200).json(user).end();

	} catch (error) {
		console.log(error)
		return res.sendStatus(400)
	}
}
