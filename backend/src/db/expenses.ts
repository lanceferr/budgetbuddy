import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({

	userId : {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'User',
		required : true,
	},

	amount : {
    	type : Number,
    	required : true,        
  	},

  	name : {
    	type : String, 
    	required : true,
    	trim : true,            
  	},

  	category : {
    	type : String,
    	required : true,           
    	trim : true,
  	},

  	notes : {
    	type : String,          
    	trim : true,
    	default : '',
  	},

  	date : {
    	type : Date,
    	default : Date.now,     
  	},

}, { timestamps: true });


export const ExpenseModel = mongoose.model('Expense', ExpenseSchema);

export const getExpenses = () => ExpenseModel.find().sort({date : -1}).lean(); // for admin
export const createExpense = (values: Record<string, any>) => new ExpenseModel(values).save().then((expense) => expense.toObject());
export const getExpenseById = (expenseId: string) => ExpenseModel.findById(expenseId).lean();
export const updateExpenseById = (expenseId: string, values: Record<string, any>) => ExpenseModel.findByIdAndUpdate(expenseId, values, { new: true }).lean();
export const deleteExpenseById = (expenseId: string) => ExpenseModel.findByIdAndDelete(expenseId);

export const getExpensesByUser = (userId: string, options: any = {}) => {
  	const query: any = { userId };
  
  	if (options.category) 
  		query.category = options.category;
  	if (options.startDate) 
  		query.date = { ...query.date, $gte: options.startDate };
  	if (options.endDate) 
  		query.date = { ...query.date, $lte: options.endDate };

  	let sort = options.sort || { date: -1 };

  	if (typeof sort === 'string') {
        sort = JSON.parse(sort);
    }
  	return ExpenseModel.find(query).sort(sort).lean();
};

export const getTotalExpenses = async (userId : string, options: any = {}) => {

	const query: any = { userId };

	if (options.category) 
  		query.category = options.category;
  	if (options.startDate) 
  		query.date = { ...query.date, $gte: options.startDate };
  	if (options.endDate) 
  		query.date = { ...query.date, $lte: options.endDate };

  	const expenses = await ExpenseModel.find(query).select('amount').lean();

  	const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return total;
} 