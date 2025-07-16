import { z } from 'zod';
import { ObjectIdSchema } from './id.schema'

export const taskZodSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  assignedTo: z.union([ObjectIdSchema, z.null()]),
  createdBy: z.union([ObjectIdSchema, z.null()]),
  priority: z.enum(['low', 'medium', 'high']),
});


export const taskCreateSchema = taskZodSchema.extend({
  columnId: ObjectIdSchema,
  boardId: ObjectIdSchema,
}).partial({
  assignedTo: true,
})

export const taskCreateWithoutCreatedBySchema = taskCreateSchema.omit({
  createdBy: true,
})

export const taskCreateWithoutBoardIdSchema = taskCreateSchema.omit({
  boardId: true,
})

export const taskUpdateSchema = taskCreateSchema.partial();

export type Task = z.infer<typeof taskZodSchema>;
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskCreateWithoutCreatedBy = z.infer<typeof taskCreateWithoutCreatedBySchema>;
export type TaskCreateWithoutBoardId = z.infer<typeof taskCreateWithoutBoardIdSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;