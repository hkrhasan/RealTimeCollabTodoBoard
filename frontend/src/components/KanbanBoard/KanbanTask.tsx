import type React from "react";
import { getPriorityColor } from "../../constants";
import type { Task } from "../../type";
import { PencilIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/solid";


type KanbanTaskProps = React.ComponentProps<"div"> & {
  task: Task;
  onAssign: (e: React.MouseEvent) => void;
}

const KanbanTask: React.FC<KanbanTaskProps> = ({ task, className = '', onAssign, ...props }) => {
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
        <TrashIcon className="icon" />
      </div>
    </div>
  </div>
}


export default KanbanTask;