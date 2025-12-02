import mongoose from 'mongoose';

const SavingsSchema = new mongoose.Schema({
    userId : {
    	type : mongoose.Schema.Types.ObjectId,
    	ref : 'User',
    	required : true,
    },

    goalName : {
    	type : String,
    	required : true,
    	trim : true,
    },

    targetAmount : {
    	type : Number,
    	required : true,
    },

    targetDate : {
    	type : Date,
    	required : true,
    },

    notes : {
    	type : String,
    	trim : true,
    	default : '',
    },

    currentAmount : {
    	type : Number,
    	default : 0,
    },

}, { timestamps: true });

export const SavingsModel = mongoose.model('Savings', SavingsSchema);

export const getSavingsGoals = () => SavingsModel.find().sort({targetDate : -1}).lean(); // for admin
export const createSavingsGoal = (values: Record<string, any>) => new SavingsModel(values).save().then((goal) => goal.toObject());
export const getSavingsGoalById = (goalId: string) => SavingsModel.findById(goalId).lean();
export const updateSavingsGoalById = (goalId: string, values: Record<string, any>) => SavingsModel.findByIdAndUpdate(goalId, values, { new: true }).lean();
export const deleteSavingsGoalById = (goalId: string) => SavingsModel.findByIdAndDelete(goalId);

export const getSavingsGoalsByUser = (userId: string, options: any = {}) => {
    const query: any = { userId };
  
    if (options.startDate) 
        query.targetDate = { ...query.targetDate, $gte: options.startDate };
    if (options.endDate) 
        query.targetDate = { ...query.targetDate, $lte: options.endDate };

    let sort = options.sort || { targetDate: -1 };

    return SavingsModel.find(query).sort(sort).lean();
};

