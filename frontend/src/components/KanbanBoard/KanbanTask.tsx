import type React from "react";
import { getPriorityColor } from "../../constants";
import type { Task } from "../../type";
import { PencilIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import useSocket from "../../hooks/useSocket";
import useAuth from "../../hooks/useAuth";
import { useKanbanBoard } from ".";
import { useState } from "react";
import { toast } from "sonner";


type KanbanTaskProps = React.ComponentProps<"div"> & {
  task: Task;
  columnId: string;
  onEdit: (e: React.MouseEvent) => void;
}

const KanbanTask: React.FC<KanbanTaskProps> = ({ task, className = '', columnId, onEdit, ...props }) => {
  const { deleteTask, smartAssign } = useSocket();
  const { user } = useAuth();
  const { handleAssign } = useKanbanBoard();
  const [isAssigning, setIsAssigning] = useState<boolean>(false)


  return <div className={`kanban-task ${className}`} draggable {...props}>

    <div className="task-header">
      <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
        {task.priority}
      </div>
      <div className="task-date">{new Date(task.createdAt).toLocaleDateString()}</div>
    </div>
    <h3 className="task-title">{task.title}</h3>
    <p className="task-description">{task.description}</p>
    <div className="task-footer">
      {task.assignedTo ? <span className="button-link" onClick={() => handleAssign({ ...task, columnId })}>{task.assignedTo.username}</span> : <button className="button" onClick={() => {
        setIsAssigning(true)
        smartAssign(columnId, task._id, task.version, (err) => {
          if (err) {
            toast.error(err);
          }
          setIsAssigning(false)
        })
      }

      }>{isAssigning ? "Assigning..." : "Smart Assign"}</button>}

      <div className="assign-actions">
        <PencilIcon className="icon" onClick={onEdit} />
        {!task.assignedTo && <UserPlusIcon className="icon" onClick={() => handleAssign({ ...task, columnId })} />}
        {task.createdBy === user?._id && <TrashIcon className="icon" onClick={() => deleteTask(task._id, columnId)} />}
      </div>
    </div>
  </div>
}


export default KanbanTask;