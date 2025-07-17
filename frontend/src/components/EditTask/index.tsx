import { useFormik } from "formik";
import { Dialog } from "../Dialog";
import { Input } from "../Input";
import { TextArea } from "../TaxtArea";
import { InputSelect } from "../InputSelect";
import { PRIORITIES } from "../../constants";
import type { TaskWithColumnId, UpdateTask } from "../../type";
import '../AddTask/AddTask.css'
import useSocket from "../../hooks/useSocket";

export interface EditTaskProps {
  task?: TaskWithColumnId | null;
  onClose: () => void;
}

export const EditTaskForm = ({
  task,
  onClose,
}: EditTaskProps) => {
  const { columns, moveTask, updateTask, users } = useSocket();


  const formik = useFormik({
    initialValues: {
      title: task?.title,
      description: task?.description,
      priority: task?.priority,
      assignedTo: task?.assignedTo?._id || "",
      columnId: task?.columnId,
    },
    enableReinitialize: true,
    validate: (values) => {
      const errors: Partial<typeof values> = {};
      if (!values.title) errors.title = "Title is required";
      if (!values.description) errors.description = "Description is required";
      if (!values.columnId) errors.columnId = "Column is required";
      return errors;
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true);
      const change = isChange()
      if (!change) {
        setSubmitting(false)
        onClose()
      }

      const { columnId } = values

      const isMove = columnId !== formik.initialValues.columnId;

      if (isMove && task && formik.initialValues.columnId && columnId) {
        moveTask(task?._id, formik.initialValues.columnId, columnId, (err) => {
          if (!err) {
            onClose()
          }
        })
      }

      let payload: UpdateTask = {}

      if (values.title !== formik.initialValues.title) {
        payload['title'] = values.title;
      }
      if (values.description !== formik.initialValues.description) {
        payload['description'] = values.description;
      }
      if (values.priority !== formik.initialValues.priority) {
        payload['priority'] = values.priority;
      }
      if (values.assignedTo !== formik.initialValues.assignedTo) {
        const user = users.find(u => u._id === values.assignedTo)
        if (!user) {
          setFieldError('assignedTo', 'Invalid user')
          return
        }

        payload['assignedTo'] = {
          "_id": user._id,
          username: user.username
        }

      }

      if (Object.entries(payload).length && task && values.columnId) {

        updateTask(task._id, values.columnId, payload, (err: string | null) => {
          if (!err) {
            onClose()
          }
        })
      }


      setSubmitting(false);
    },
  });

  const isChange = () => {
    return formik.values.title !== formik.initialValues.title ||
      formik.values.description !== formik.initialValues.description ||
      formik.values.priority !== formik.initialValues.priority ||
      formik.values.assignedTo !== formik.initialValues.assignedTo ||
      formik.values.columnId !== formik.initialValues.columnId;
  }


  return (
    <Dialog isOpen={Boolean(task)} onClose={onClose} title="Edit Task" size="md">
      <form className="add-task-form" onSubmit={formik.handleSubmit} noValidate>
        <Input
          label="Title"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && formik.errors.title ? formik.errors.title : undefined}
        />
        <InputSelect
          label="Priority"
          name="priority"
          value={formik.values.priority}
          onChange={formik.handleChange}
          options={PRIORITIES.map(p => ({
            value: p,
            label: p.charAt(0).toUpperCase() + p.slice(1)
          }))}
        />

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
        <InputSelect
          label="Column"
          name="columnId"
          value={formik.values.columnId}
          onChange={formik.handleChange}
          options={columns.map(c => ({
            value: c._id,
            label: c.title
          }))}
        />

        <TextArea
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.description && formik.errors.description ? formik.errors.description : undefined}
        />
        <button
          type="submit"
          className="button"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Saving..." : isChange() ? "Save Changes" : "Close"}
        </button>
      </form>
    </Dialog>
  );
};

export default EditTaskForm;