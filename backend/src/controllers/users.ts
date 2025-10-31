import express from 'express';

import { getUsers, deleteUserById, updateUserById } from '../db/users.ts';

export const getAllUsers = async (req: express.Request, res: express.Response) => {

	try {

		const users = await getUsers();

		return res.status(200).json(users);

	} catch(error) {

		console.log(error);
		return res.status(500).json({ error: 'Failed to fetch users' });

	}

};

export const deleteUser = async (req: express.Request, res: express.Response) => {

	try {

		const { id } = req.params;

		const deletedUser = await deleteUserById(id);

		if (!deletedUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		return res.status(200).json({ message: 'User deleted successfully', user: deletedUser });

	} catch(error) {

		console.log(error);
		return res.status(500).json({ error: 'Failed to delete user' });

	}

};

export const updateUser = async (req: express.Request, res: express.Response) => {

	try {

		const { id } = req.params;
		const { username } = req.body;

		if (!username) {
			return res.status(400).json({ error: 'Username is required' });
		}

		const updatedUser = await updateUserById(id, { username });

		if (!updatedUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		return res.status(200).json(updatedUser);

	} catch(error) {

		console.log(error);
		return res.status(500).json({ error: 'Failed to update user' });

	}

};