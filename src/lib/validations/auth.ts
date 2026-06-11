import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email is not valid"),
  password: z.string().min(8, "Password minimal 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email("Email is not valid"),
  phone: z.string().min(1, "Phone Number cannot be empty"),
  password: z.string().min(8, "Password minimal 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password is not the same",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;