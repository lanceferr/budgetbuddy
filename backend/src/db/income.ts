import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    source: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },

  { timestamps: true }
);

export default mongoose.model("Income", IncomeSchema);
export const IncomeModel = mongoose.model("Income", IncomeSchema);
export const createIncome = (values: Record<string, any>) => new IncomeModel(values).save().then((b) => b.toObject());
export const getIncome = () => IncomeModel.find().sort({ createdAt: -1 }).lean(); // admin
export const getIncomeById = (id: string) => IncomeModel.findById(id).lean();
export const updateIncomeById = (id: string, values: Record<string, any>) =>
  IncomeModel.findByIdAndUpdate(id, values, { new: true, runValidators: true }).lean();
export const deleteIncomeById = (id: string) => IncomeModel.findByIdAndDelete(id);
export const getIncomeByUser = (userId: string) => IncomeModel.find({ userId }).sort({ createdAt: -1 }).lean();