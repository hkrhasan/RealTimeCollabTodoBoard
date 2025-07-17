import { z } from 'zod';
import { ObjectIdSchema } from './id.schema'

export const taskZodSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  assignedTo: z.union([ObjectIdSchema, z.null()]),
  createdBy: z.union([ObjectIdSchema, z.null()]),
  priority: z.enum(['low', 'medium', 'high']),
  position: z.number().optional(),
});


export const taskCreateSchema = taskZodSchema.extend({
  columnId: ObjectIdSchema,
  boardId: ObjectIdSchema,
}).partial({
  assignedTo: true,
  position: true,
})

export const taskCreateWithoutCreatedBySchema = taskCreateSchema.omit({
  createdBy: true,
})

export const taskCreateWithoutBoardIdSchema = taskCreateSchema.omit({
  boardId: true,
})

export const taskUpdateSchema = taskCreateSchema.omit({ createdBy: true, position: true }).partial({
  title: true,
  description: true,
  assignedTo: true,
  priority: true,
}).extend({
  taskId: ObjectIdSchema,
});

export const taskSmartAssignSchema = taskCreateSchema.pick({
  boardId: true,
  columnId: true,
}).extend({
  taskId: ObjectIdSchema,
})

export const taskDeleteSchema = taskCreateSchema.pick({
  columnId: true,
  boardId: true,
}).extend({
  taskId: ObjectIdSchema,
})

export const taskMoveSchema = taskDeleteSchema.omit({
  columnId: true
}).extend({
  sourceColumnId: ObjectIdSchema,
  targetColumnId: ObjectIdSchema
})

export type Task = z.infer<typeof taskZodSchema>;
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskCreateWithoutCreatedBy = z.infer<typeof taskCreateWithoutCreatedBySchema>;
export type TaskCreateWithoutBoardId = z.infer<typeof taskCreateWithoutBoardIdSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type TaskDelete = z.infer<typeof taskDeleteSchema>;
export type TaskMove = z.infer<typeof taskMoveSchema>;
export type TaskSmartAssign = z.infer<typeof taskSmartAssignSchema>;