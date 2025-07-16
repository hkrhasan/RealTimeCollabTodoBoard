import type React from "react";
import KanbanTask from "./KanbanTask";
import type { Column, Task } from "../../type";
import ScrollableArea from "../ScrollableArea";
import AddTask from "../AddTask";



type KanbanColumnProps = React.ComponentProps<"div"> & {
  column: Column;
  taskDragStart: (e: React.DragEvent, task: Task) => void
  isDragOver: boolean;
  onAssign: (e: React.MouseEvent, task: Task) => void
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  className = '',
  style,
  column,
  isDragOver,
  taskDragStart,
  onAssign,
  ...props
}) => {

  return <div className={`kanban-column ${isDragOver ? "drag-over" : ""} ${className}`} style={{ ...style, ...{ "--column-color": column.color } as React.CSSProperties }} {...props}>
    <div className="kanban-column-header">
      <div className="kanban-column-title-wrapper">
        <div className="kanban-column-indicator" style={{ backgroundColor: column.color }}></div>
        <h2 className="kanban-column-title">{column.title}</h2>
        <span className="task-count">({column.tasks.length})</span>
      </div>
      <AddTask columnId={column._id} />
    </div>
    <ScrollableArea offset={30}>
      <div className="kanban-column-content">

        {column.tasks.map((task, index) => <div key={task._id} className="task-wrapper" style={{ "--task-index": index } as React.CSSProperties}>
          <KanbanTask
            task={task}
            onDragStart={(e) => taskDragStart(e, task)}
            onAssign={(e) => onAssign(e, task)}
          />
        </div>)}


        {column.tasks.length === 0 && (
          <div className="empty-column">
            <p>No tasks yet</p>
            <p>Drop tasks here</p>
          </div>
        )}


      </div>

    </ScrollableArea>


  </div>
}

export default KanbanColumn;