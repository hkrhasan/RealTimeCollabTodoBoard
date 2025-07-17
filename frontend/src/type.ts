import type { IUser } from "./contexts/AuthContext";

export type CreateTask = Omit<Task, '_id' | 'assignedTo' | 'createdAt'>
export type UpdateTask = Partial<Omit<Task, '_id' | 'createdAt' | 'createdBy'>>

export type Board = {
  _id: string;
  title: string;
  columns: Column[];
}

export type Priority = "low" | "medium" | "high";

export type Task = {
  _id: string;
  title: string;
  description: string;
  assignedTo: IUser | null;
  priority: Priority;
  createdAt: Date
  createdBy?: string | null
}

export type TaskWithColumnId = Task & {
  columnId: string
}

export type Column = {
  _id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export type ErrorResponse = {
  error?: string;
}