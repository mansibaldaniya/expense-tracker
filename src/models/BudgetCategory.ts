import mongoose, { Schema, models, model } from "mongoose";

export type BudgetCategoryDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  normalizedName: string;
  createdAt: Date;
  updatedAt: Date;
};

const budgetCategorySchema = new Schema<BudgetCategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, trim: true, lowercase: true, index: true, unique: true },
  },
  { timestamps: true }
);

budgetCategorySchema.index({ normalizedName: 1 }, { unique: true });

export const BudgetCategoryModel = models.BudgetCategory || model<BudgetCategoryDocument>("BudgetCategory", budgetCategorySchema);
