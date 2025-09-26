import { z } from "zod";

export const createUserSchema = z
  .object({
    username: z.string().nonempty().min(3).max(255),
    display_name: z.string().nonempty().min(3).max(255),
    profit_center_id: z.string().nonempty(),
    password: z.string().nonempty().min(3).max(255),
    password_confirmation: z.string().nonempty().min(3).max(255),
    level: z.number().default(1),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const updateUserSchema = z
  .object({
    username: z.string().nonempty(),
    display_name: z.string().nonempty(),
    password: z.string().nonempty().min(3).max(255),
    password_confirmation: z.string().nonempty().min(3).max(255),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
