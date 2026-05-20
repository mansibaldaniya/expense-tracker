import { z } from "zod";

export const passwordRequirementsMessage =
  "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.";

const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100)
  .regex(/[A-Z]/, "Password must include at least 1 uppercase letter")
  .regex(/\d/, "Password must include at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least 1 special character");

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: strongPasswordSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters long"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"],
  });
