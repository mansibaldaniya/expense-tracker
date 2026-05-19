import mongoose, { Schema, models, model } from "mongoose";

export type BudgetDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  category: string;
  limit: number;
  month: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
};

const budgetSchema = new Schema<BudgetDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true, index: true },
    limit: { type: Number, required: true, min: 0 },
    month: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export const BudgetModel = models.Budget || model<BudgetDocument>("Budget", budgetSchema);
