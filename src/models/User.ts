import mongoose, { Schema, models, model } from "mongoose";
import { AuthRole } from "@/lib/auth";

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: AuthRole;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const UserModel = models.User || model<UserDocument>("User", userSchema);
