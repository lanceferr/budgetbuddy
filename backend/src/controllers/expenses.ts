import express from 'express';
import _ from 'lodash';
import { createExpense, getExpensesByUser, getTotalExpenses} from '../db/expenses.js'

export const addExpense = async (req : express.Request, res : express.Response) => {
	try {
		// Get userId from authenticated session (not from URL)
		const currentUserId = _.get(req, 'identity._id') as unknown as string;
		
		if (!currentUserId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}
		
		const { amount, name, category, notes, date } = req.body;

		if(!amount || !category || !name){
			return res.status(400).json({ error : "Amount, Name, and Category are required"});
		}

		if (isNaN(Number(amount)) || Number(amount) <= 0) {
		    return res.status(400).json({ error: "Amount must be a positive number" });
		}

		const expense = await createExpense({
			userId : currentUserId,  // Use session user ID
			amount, 
			name,
			category, 
			notes, 
			date  // Optional - defaults to today if not provided
		});

		return res.status(200).json({
	    	message : 'Expense creation successful',
	      	expense : {
	        	userId : expense.userId,
	        	amount : expense.amount,
	        	name : expense.name,
	        	category : expense.category,
	        	notes : expense.notes,
	        	date : expense.date
	      }
	    }).end();

	} catch(error){
		console.log(error);
		return res.status(500).json({ error: 'Expense Creation failed' });
	}
}

export const getExpenses = async (req : express.Request, res : express.Response) => {
	try {
		// Get userId from authenticated session (not from URL)
		const currentUserId = _.get(req, 'identity._id') as unknown as string;
		
		if (!currentUserId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}
		
		const { startDate, endDate, category, sort} = req.query;

		const options: any = {};

		if(category){
			// Decode URL encoding and trim whitespace for better matching
			options.category = decodeURIComponent(category as string).trim();
		}

		if(startDate){
			options.startDate = new Date(startDate as string);
		}

		if(endDate){
			options.endDate = new Date(endDate as string);
		}

		if(sort){
			options.sort = sort; //format should be {"amount":-1} no space
		}
		
		const expenses = await getExpensesByUser(currentUserId, options);

		const total = await getTotalExpenses(currentUserId, options);

		return res.status(200).json({ 
			message: "Expenses was retrieved",
			expenses,
			total,
		})

	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: 'Retrieving Expenses Failed!!' });
	}
}

