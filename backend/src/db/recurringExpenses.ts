import mongoose from 'mongoose';

const RecurringExpenseSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  category: {
    type: String,
    required: true,
    trim: true,
  },

  frequency: {
    type: String,
    required: true,
    enum: ['minutely', 'daily', 'weekly', 'monthly'],
  },

  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },

  endDate: {
    type: Date,
    default: null, // null means no end date (continues indefinitely)
  },

  lastGenerated: {
    type: Date,
    default: null, // tracks when the last expense was generated
  },

  notes: {
    type: String,
    trim: true,
    default: '',
  },

  isActive: {
    type: Boolean,
    default: true, // allows pausing without deletion
  },

}, { timestamps: true });

export const RecurringExpenseModel = mongoose.model('RecurringExpense', RecurringExpenseSchema);

export const createRecurringExpense = (values: Record<string, any>) => 
  new RecurringExpenseModel(values).save().then((recurring) => recurring.toObject());

export const getRecurringExpenses = () => 
  RecurringExpenseModel.find().sort({ createdAt: -1 }).lean(); // admin

export const getRecurringExpensesByUser = (userId: string, includeInactive = false) => {
  const query: any = { userId };
  if (!includeInactive) {
    query.isActive = true;
  }
  return RecurringExpenseModel.find(query).sort({ createdAt: -1 }).lean();
};

export const getRecurringExpenseById = (id: string) => 
  RecurringExpenseModel.findById(id).lean();

export const updateRecurringExpenseById = (id: string, values: Record<string, any>) =>
  RecurringExpenseModel.findByIdAndUpdate(id, values, { new: true, runValidators: true }).lean();

export const deleteRecurringExpenseById = (id: string) => 
  RecurringExpenseModel.findByIdAndDelete(id);

// Get active recurring expenses that need processing
export const getActiveRecurringExpenses = () =>
  RecurringExpenseModel.find({ 
    isActive: true,
    $or: [
      { endDate: null },
      { endDate: { $gte: new Date() } }
    ]
  }).lean();

// Get recurring expenses that need to generate an entry
export const getRecurringExpensesDueForGeneration = () => {
  const now = new Date();
  return RecurringExpenseModel.find({
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  }).lean();
};