import express from 'express';
import { createExpense, getExpensesByUser, getTotalExpenses} from '../db/expenses.js'

export const addExpense = async (req : express.Request, res : express.Response) => {
	try {
		const { id } = req.params;
		const { amount, name, category, notes, date } = req.body;

		if(!amount || !category || !name){
			return res.status(400).json({ error : "Amount, Name, and Category are required"});
		}

		if (isNaN(Number(amount)) || Number(amount) <= 0) {
		    return res.status(400).json({ error: "Amount must be a positive number" });
		}

		const expense = await createExpense({
			userId : id,
			amount, 
			name,
			category, 
			notes, 
			date
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
		const { id } = req.params;
		const { startDate, endDate, category, sort} = req.query;

		const options: any = {};

		if(category){
			options.category = category;
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
		const expenses = await getExpensesByUser(id, options);

		const total = await getTotalExpenses(id, options);

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

