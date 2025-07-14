import { z } from 'zod';


export const userZodSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  rtHash: z.string().optional(),
});
export const userUpdateSchema = userZodSchema.partial();
export const userCreateSchema = userZodSchema.omit({
  rtHash: true,
});
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type User = z.infer<typeof userZodSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
