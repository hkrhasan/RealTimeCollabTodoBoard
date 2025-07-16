import type { Column } from "./type"

export const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'Todo',
    color: "#64748b",
    tasks: [
      {
        id: "1",
        title: "Design new landing page",
        description: "Create wireframes and mockups for the new landing page",
        assignedTo: "hkrhasan",
        priority: "high",
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        title: "Fix login bug",
        description: "Users are unable to login with social media accounts",
        assignedTo: "testuser",
        priority: "medium",
        createdAt: new Date("2024-01-16"),
      },
      {
        id: "5",
        title: "Update documentation",
        description: "Update API documentation with new endpoints",
        assignedTo: null,
        priority: "low",
        createdAt: new Date("2024-01-17"),
      },
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: "#f59e0b",
    tasks: [
      {
        id: "3",
        title: "Implement user dashboard",
        description: "Build the main user dashboard with analytics",
        assignedTo: "hkrhasan",
        priority: "high",
        createdAt: new Date("2024-01-14"),
      },
    ]
  },
  {
    id: 'done',
    title: 'Done',
    color: "#10b981",
    tasks: [
      {
        id: "4",
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment",
        assignedTo: "testuser",
        priority: "medium",
        createdAt: new Date("2024-01-10"),
      },
    ]
  }
]


export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "#ef4444"
    case "medium":
      return "#f59e0b"
    case "low":
      return "#10b981"
    default:
      return "#6b7280"
  }
}