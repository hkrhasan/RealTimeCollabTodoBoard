import type React from "react";
import { getPriorityColor } from "../../constants";
import type { Task } from "../../type";
import { PencilIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import useSocket from "../../hooks/useSocket";
import useAuth from "../../hooks/useAuth";


type KanbanTaskProps = React.ComponentProps<"div"> & {
  task: Task;
  onAssign: (e: React.MouseEvent) => void;
  columnId: string;
}

const KanbanTask: React.FC<KanbanTaskProps> = ({ task, className = '', onAssign, columnId, ...props }) => {
  const { deleteTask } = useSocket();
  const { user } = useAuth();

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
      {task.assignedTo ? <span className="button-link">{task.assignedTo.username}</span> : <button className="button">Smart Assign</button>}

      <div className="assign-actions">
        <PencilIcon className="icon" />
        {!task.assignedTo && <UserPlusIcon className="icon" onClick={onAssign} />}
        {task.createdBy === user?._id && <TrashIcon className="icon" onClick={() => deleteTask(task._id, columnId)} />}
      </div>
    </div>
  </div>
}


export default KanbanTask;