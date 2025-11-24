import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  period: {
    // 'weekly' or 'monthly'
    type: String,
    required: true,
    enum: ['weekly', 'monthly'],
  },

  // optional category. If not provided or empty -> overall budget
  category: {
    type: String,
    trim: true,
    default: '',
  },

}, { timestamps: true });

export const BudgetModel = mongoose.model('Budget', BudgetSchema);

export const createBudget = (values: Record<string, any>) => new BudgetModel(values).save().then((b) => b.toObject());
export const getBudgets = () => BudgetModel.find().sort({ createdAt: -1 }).lean(); // admin
export const getBudgetById = (id: string) => BudgetModel.findById(id).lean();
export const updateBudgetById = (id: string, values: Record<string, any>) =>
  BudgetModel.findByIdAndUpdate(id, values, { new: true, runValidators: true }).lean();
export const deleteBudgetById = (id: string) => BudgetModel.findByIdAndDelete(id);

export const getBudgetsByUser = (userId: string) => BudgetModel.find({ userId }).sort({ createdAt: -1 }).lean();
