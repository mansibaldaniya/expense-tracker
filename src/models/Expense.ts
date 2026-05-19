import mongoose, { Schema, models, model } from "mongoose";

export type ExpenseDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  date: Date;
  note: string;
  createdAt: Date;
  updatedAt: Date;
};

const expenseSchema = new Schema<ExpenseDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

export const ExpenseModel = models.Expense || model<ExpenseDocument>("Expense", expenseSchema);
