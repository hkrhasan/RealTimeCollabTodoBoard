import { z } from 'zod';
import { taskZodSchema } from './task.schema';

export const columnZodSchema = z.object({
  title: z.string().min(1),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/), // simple hex‑color check
  tasks: z.array(taskZodSchema),
});

export type Column = z.infer<typeof columnZodSchema>;