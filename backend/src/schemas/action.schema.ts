import z from "zod";
import { ObjectIdSchema } from "./id.schema";


export const actionZodSchema = z.object({
  type: z.enum(['add', 'edit', 'delete', 'assign', 'drag-drop']),
  who: z.union([ObjectIdSchema, z.null()]),
  what: z.union([ObjectIdSchema, z.null()]),
})


export type Action = z.infer<typeof actionZodSchema>;