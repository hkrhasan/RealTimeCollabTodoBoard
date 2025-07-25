import type React from "react"
import './KanbanBoard.css'
import { createContext, useContext, useEffect, useRef, useState } from "react"
import KanbanColumn from "./KanbanColumn"
import type { ConflictedTask, Task, TaskWithColumnId } from "../../type"
import { useDialogState } from "../Dialog"
import useSocket from "../../hooks/useSocket"
import { notImplemnted } from "../../constants"
import EditTaskForm from "../EditTask"
import AssignTaskForm from "../AssignTask"
import { TaskConflictDailog } from "../TaskConflictDailog"


type KanbanBoardContextType = {
  handleEdit: (columnId: string, task: Task) => void;
  handleAssign: (task: TaskWithColumnId) => void;
}

export const KanbanBoardContext = createContext<KanbanBoardContextType>({
  handleEdit: notImplemnted,
  handleAssign: notImplemnted,
})

export const useKanbanBoard = () => useContext(KanbanBoardContext);

type KanbanBoardProps = React.ComponentProps<"div"> & {
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ className = '' }) => {
  const { isConnected, board, columns, moveTask, conflictedTask, setConflictedTask } = useSocket();
  const [_, setUnResolvedTask] = useState<ConflictedTask[]>([])
  const [assigningTask, setAssigningTask] = useState<TaskWithColumnId | null>(null)
  const assigmentDialogState = useDialogState();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [editTask, setEditTask] = useState<TaskWithColumnId | null>(null)
  const dragCounter = useRef(0);

  useEffect(() => {
    initialEffect();
  }, [board, isConnected])

  const initialEffect = async () => {
    if (!board) return;
    // const users = await usersAPI.getUsers();

  }

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

  const handleDragLeave = (_: React.DragEvent) => {
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
    const sourceColumn = columns.find((col) => col.tasks.some((task) => task._id === draggedTask._id))

    if (!sourceColumn || sourceColumn._id === targetColumnId) {
      setDraggedTask(null)
      return
    }

    moveTask(draggedTask._id, sourceColumn._id, targetColumnId)
    setDraggedTask(null)
  }

  const handleEdit = (columnId: string, task: Task) => {
    setEditTask({ ...task, columnId })
  }

  const handleAssign = (task: TaskWithColumnId) => {
    setAssigningTask(task)
    assigmentDialogState.open()
  }


  if (!isConnected) return <div className="">
    <h1>Socket Disconnected</h1>
  </div>


  return <KanbanBoardContext.Provider value={{
    handleEdit,
    handleAssign,
  }}>
    <div className={`kanban-board ${className}`}>
      {columns.map((col) =>
        <div
          key={col._id}
          className="column-wrapper"
          onDragEnter={(e) => handleDragEnter(e, col._id)} onDragLeave={handleDragLeave}
        >
          <KanbanColumn
            column={col}
            onDrop={(e) => handleDrop(e, col._id)}
            onDragOver={handleDragOver}
            taskDragStart={handleDragStart}
            isDragOver={dragOverColumn === col._id}
          />
        </div>)}

      <EditTaskForm task={editTask} onClose={function (): void {
        setEditTask(null)
      }} />

      <AssignTaskForm task={assigningTask} onClose={function (): void {
        setAssigningTask(null)
      }} />

      {conflictedTask && <TaskConflictDailog conflictedTask={conflictedTask} open={Boolean(conflictedTask)} onCancel={() => {
        setUnResolvedTask((prev) => {
          return [...prev, conflictedTask]
        })
        setConflictedTask(null)
      }} onResolve={function (resolvedTask: TaskWithColumnId): void {
        if (editTask) setEditTask(resolvedTask);
        if (assigningTask) setAssigningTask(resolvedTask)
        setConflictedTask(null)
      }} />}

    </div>
  </KanbanBoardContext.Provider>
}

export default KanbanBoard