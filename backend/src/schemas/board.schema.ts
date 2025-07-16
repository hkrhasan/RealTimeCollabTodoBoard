import { z } from 'zod';

export const boardZodSchema = z.object({
  title: z.string().min(1),
  columns: z.array(z.string()),
  actions: z.array(z.string()),
});

export type Board = z.infer<typeof boardZodSchema>;
