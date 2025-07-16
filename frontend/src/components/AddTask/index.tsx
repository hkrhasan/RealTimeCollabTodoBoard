import { useFormik } from "formik";
import { type FC } from "react";
import { Dialog, useDialogState } from "../Dialog";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Input } from "../Input";
import './AddTask.css';
import { TextArea } from "../TaxtArea";
import { InputSelect } from "../InputSelect";
import { PRIORITIES } from "../../constants";
import useSocket from "../../hooks/useSocket";
import type { Priority, Task } from "../../type";

type AddTaskValues = {
  title: string;
  description: string;
  priority: Priority;
};

type AddTaskProps = {
  columnId: string;
}

const AddTask: FC<AddTaskProps> = ({ columnId, }) => {
  const dialogState = useDialogState();
  const { createTask } = useSocket()

  const formik = useFormik<AddTaskValues>({
    initialValues: {
      title: "",
      description: "",
      priority: "low",
    },
    validate: (values) => {
      const errors: Partial<AddTaskValues> = {};
      if (!values.title) errors.title = "Title is required";
      if (!values.description) errors.description = "Description is required";
      return errors;
    },
    onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
      setSubmitting(true);
      createTask(columnId, values, (err, task) => {
        if (err) {
          if (err.includes('title')) {
            setFieldError('title', err);
          }
          setSubmitting(false);
          return;
        }

        dialogState.close();
        resetForm();
        setSubmitting(false);
      })
    },
  });

  return (
    <div className="add-task">
      <PlusIcon className="icon" onClick={dialogState.open} />
      <Dialog isOpen={dialogState.isOpen} onClose={dialogState.close} title="Create Task" size="md">
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
            {formik.isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      </Dialog>
    </div>
  );
};

export default AddTask;