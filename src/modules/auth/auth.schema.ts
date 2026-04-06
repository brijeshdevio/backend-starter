import { z } from "zod";

export const RegisterSchema = z
  .object({
    name: z.string().min(3).max(30),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(30),
  })
  .strict();

export const LoginSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
