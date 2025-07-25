import { useState } from "react";
import './TaskConflictDailog.css'
import type { ConflictedTask, Task, TaskWithColumnId, UpdateTask } from "../../type"
import { Dialog } from "../Dialog";
import type { IUser } from "../../contexts/AuthContext";
import useSocket from "../../hooks/useSocket";
import { toast } from "sonner";


export type TaskConflictDailogProps = {
  conflictedTask: ConflictedTask;
  open: boolean;
  onCancel: () => void;
  onResolve: (resolvedTask: TaskWithColumnId) => void;
}

export const TaskConflictDailog = ({ conflictedTask, open, onCancel, onResolve }: TaskConflictDailogProps) => {
  const { updateTask } = useSocket()
  const [selectedResolution, setSelectedResolution] = useState<"overwrite" | "merge" | null>(null)
  const [mergedTask, setMergedTask] = useState<Task>(conflictedTask.local)

  const handleFieldMerge = (field: keyof Task, useLocal: boolean) => {
    setMergedTask((prev) => ({
      ...prev,
      [field]: useLocal ? conflictedTask.local[field] : conflictedTask.server[field],
    }))
  }

  const handleResolve = () => {
    let resolvedTask: UpdateTask = { ...mergedTask, version: conflictedTask.server.version };

    if (selectedResolution === "overwrite") {
      resolvedTask = { ...conflictedTask.local, overwrite: true }
    }

    updateTask(mergedTask._id, conflictedTask.columnId, resolvedTask, (err: string | null) => {
      if (!err) {
        const { overwrite, ...task } = resolvedTask;
        onResolve({
          ...task, columnId: conflictedTask.columnId,
        } as TaskWithColumnId)
      } else {
        toast.error(err)
      }
    })
  }

  const getFieldDiff = (field: keyof Task) => {
    const localValue = conflictedTask.local[field]
    const serverValue = conflictedTask.server[field]
    return {
      hasConflict: JSON.stringify(localValue) !== JSON.stringify(serverValue),
      localValue,
      serverValue,
    }
  }

  return <Dialog isOpen={open} onClose={() => { }} title="Merge Conflict Detected">
    <div className="conflict-resolution">
      <div className="conflict-header">
        <div className="conflict-info">
          <h4>Task: {conflictedTask?.local.title}</h4>
          <p>Another user modified this task while you were editing it. Please choose how to resolve the conflict.</p>
        </div>
        <div className="conflict-meta">
          <div className="version-info">
            <span>Your version: {conflictedTask?.local.version}</span>
            <span>Server version: {conflictedTask?.server.version}</span>
          </div>
        </div>
      </div>
      <div className="resolution-options">
        <div className="resolution-option">
          <label>
            <input
              type="radio"
              name="resolution"
              value="overwrite"
              checked={selectedResolution === "overwrite"}
              onChange={() => setSelectedResolution("overwrite")}
            />
            <strong>Overwrite: </strong> Use your changes and discard server changes
          </label>
        </div>
        <div className="resolution-option">
          <label>
            <input
              type="radio"
              name="resolution"
              value="merge"
              checked={selectedResolution === "merge"}
              onChange={() => setSelectedResolution("merge")}
            />
            <strong>Merge: </strong> Manually select which changes to keep
          </label>
        </div>
      </div>

      {selectedResolution === "merge" && (
        <div className="merge-interface">
          <h5>Select which version to keep for each field:</h5>
          {conflictedTask.conflictedFields.map((field) => {
            const diff = getFieldDiff(field as keyof Task)
            if (!diff.hasConflict) return null
            let localValue = diff.localValue;
            let serverValue = diff.serverValue;

            if (field === 'assignedTo') {
              localValue = (diff.localValue as IUser)?.username
              serverValue = (diff.serverValue as IUser)?.username
            }

            return (
              <div key={field} className="field-conflict">
                <h6>{field.charAt(0).toUpperCase() + field.slice(1)}</h6>
                <div className="field-options">
                  <div className="field-option">
                    <label>
                      <input
                        type="radio"
                        name={`field-${field}`}
                        checked={JSON.stringify(mergedTask[field as keyof Task]) === JSON.stringify(diff.localValue)}
                        onChange={() => handleFieldMerge(field as keyof Task, true)}
                      />
                      <span>Your version</span>
                    </label>
                    <div className="field-preview local">
                      {String(localValue)}
                    </div>

                  </div>
                  <div className="field-option">
                    <label>
                      <input
                        type="radio"
                        name={`field-${field}`}
                        checked={JSON.stringify(mergedTask[field as keyof Task]) === JSON.stringify(diff.serverValue)}
                        onChange={() => handleFieldMerge(field as keyof Task, false)}
                      />
                      <span>Server version</span>
                    </label>
                    <div className="field-preview server">
                      {String(serverValue)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="conflict-preview">
        <h5>Preview of resolved task:</h5>
        <div className="task-preview">
          <div className="preview-field">
            <strong>Title:</strong> {selectedResolution === "merge" ? mergedTask.title : conflictedTask.local.title}
          </div>
          <div className="preview-field">
            <strong>Description:</strong>{" "}
            {selectedResolution === "merge" ? mergedTask.description : conflictedTask.local.description}
          </div>
          <div className="preview-field">
            <strong>Priority:</strong>{" "}
            {selectedResolution === "merge" ? mergedTask.priority : conflictedTask.local.priority}
          </div>
          <div className="preview-field">
            <strong>Assigned:</strong>{" "}
            {selectedResolution === "merge" ? mergedTask.assignedTo?.username : conflictedTask.local.assignedTo?.username}
          </div>
        </div>
      </div>


      <div className="conflict-actions">
        <button className="button outline" onClick={onCancel}>
          Cancel
        </button>
        <button className="button danger" onClick={handleResolve} disabled={!selectedResolution}>
          Resolve Conflict
        </button>
      </div>
    </div>


  </Dialog>
}