import { useFormik } from "formik";
import type { TaskWithColumnId } from "../../type"
import { Dialog } from "../Dialog";
import { InputSelect } from "../InputSelect";
import useSocket from "../../hooks/useSocket";


export type AssignTaskProps = {
  task?: TaskWithColumnId | null;
  onClose: () => void;
}

export const AssignTaskForm = ({
  task,
  onClose,
}: AssignTaskProps) => {
  const { updateTask, users } = useSocket();
  const formik = useFormik({
    initialValues: {
      assignedTo: task?.assignedTo?._id || "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const user = users.find(u => u._id === values.assignedTo)

      if (task && user) {
        updateTask(task._id, task.columnId, {
          assignedTo: {
            _id: values.assignedTo,
            username: user.username
          }
        }, (err) => {
          if (!err) onClose()
        })
      }
    },
  });

  return <Dialog isOpen={Boolean(task)} onClose={onClose} title="Edit Task" size="md">
    <form className="assign-form" onSubmit={formik.handleSubmit} noValidate>
      <InputSelect
        label="Assign to"
        name="assignedTo"
        value={formik.values.assignedTo}
        onChange={formik.handleChange}
        options={users.map(u => ({
          value: u._id,
          label: u.username
        }))}
      />
      <button className="button" type="submit">Assign</button>
    </form>
  </Dialog>
}


export default AssignTaskForm;