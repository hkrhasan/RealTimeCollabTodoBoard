

export type Task = {
  id: string;
  title: string;
  description: string;
  assignedTo: string | null;
  priority: "low" | "medium" | "high";
  createdAt: Date
}

export type Column = {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

