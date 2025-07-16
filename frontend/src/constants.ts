
export const PRIORITIES = [
  "high",
  "medium",
  "low",
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