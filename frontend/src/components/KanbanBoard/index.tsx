import type React from "react"
import './KanbanBoard.css'
import { useRef, useState } from "react"
import { initialColumns } from "../../constants"
import KanbanColumn from "./KanbanColumn"
import type { Column, Task } from "../../type"
import AddTodo from "../AddTodo"
import { Dialog, useDialogState } from "../Dialog"

type KanbanBoardProps = React.ComponentProps<"div"> & {
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ className = '' }) => {
  const [assigningTask, setAssigningTask] = useState<Task | null>(null)
  const assigmentDialogState = useDialogState();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    dragCounter.current++
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragOverColumn(null)

    if (!draggedTask) return

    // Find source column
    const sourceColumn = columns.find((col) => col.tasks.some((task) => task.id === draggedTask.id))

    if (!sourceColumn || sourceColumn.id === targetColumnId) {
      setDraggedTask(null)
      return
    }

    // Update columns
    setColumns((prevColumns) => {
      return prevColumns.map((column) => {
        if (column.id === sourceColumn.id) {
          // Remove task from source column
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
          }
        } else if (column.id === targetColumnId) {
          // Add task to target column
          return {
            ...column,
            tasks: [...column.tasks, draggedTask],
          }
        }
        return column
      })
    })

    setDraggedTask(null)
  }



  return <div className={`kanban-board ${className}`}>
    {columns.map((col) =>
      <div
        key={col.id}
        className="column-wrapper"
        onDragEnter={(e) => handleDragEnter(e, col.id)} onDragLeave={handleDragLeave}
      >
        <KanbanColumn
          column={col}
          onDrop={(e) => handleDrop(e, col.id)}
          onDragOver={handleDragOver}
          taskDragStart={handleDragStart}
          isDragOver={dragOverColumn === col.id}
          onAssign={(_, task) => {
            setAssigningTask(task)
            assigmentDialogState.open()
          }}
        />
      </div>)}

    <Dialog isOpen={assigmentDialogState.isOpen} onClose={assigmentDialogState.close} title="Task Assignment" size="sm">
      <p>this dialog handle ticket assignment</p>

    </Dialog>
  </div>
}

export default KanbanBoard