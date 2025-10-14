import express from 'express';
import _ from 'lodash';

import { getUserBySessionToken } from '../db/users.js';

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

	try {
        
		const sessionToken = req.cookies['AUTH'];

		if(!sessionToken){
			return res.status(401).json({ error: 'Not authenticated' });
		}

		const existingUser = await getUserBySessionToken(sessionToken);

		if(!existingUser){
			return res.status(401).json({ error: 'Invalid session' });
		}

		_.merge(req, { identity: existingUser });

		return next();

	}catch(error) {

		console.log(error);
		return res.status(500).json({ error: 'Internal server error' });

	}
};

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

	try {

		const { id } = req.params;
		const currentUserId = _.get(req, 'identity._id') as unknown as string;

		if (!currentUserId) {
			return res.status(401).json({ error: 'Not authenticated' });
		}

		if (currentUserId.toString() !== id) {
			return res.status(403).json({ error: 'Forbidden' });
		}

		return next();

	} catch(error) {

		console.log(error);
		return res.status(500).json({ error: 'Internal server error' });

	}

};