import bcrypt from "bcryptjs";
import { UserModel } from "@/models/User";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { signAuthToken } from "@/lib/auth";

export async function registerUser(input: unknown) {
  const payload = registerSchema.parse(input);
  const existing = await UserModel.findOne({ email: payload.email }).lean();

  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const password = await bcrypt.hash(payload.password, 12);
  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    password,
    role: "user",
  });

  const token = signAuthToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function loginUser(input: unknown) {
  const payload = loginSchema.parse(input);
  const user = await UserModel.findOne({ email: payload.email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(payload.password, user.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const token = signAuthToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getUserById(userId: string) {
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
