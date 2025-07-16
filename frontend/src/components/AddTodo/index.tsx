import type { FC } from "react";
import { Dialog, useDialogState } from "../Dialog"


type AddTodoProps = {}

const AddTodo: FC<AddTodoProps> = () => {
  const dialogState = useDialogState();

  return <div className="">
    <button className="button" onClick={dialogState.open}>
      add
    </button>
    <Dialog isOpen={dialogState.isOpen} onClose={dialogState.close} title="Confirm Deletion" size="sm">
      <p>Are you sure you want to delete this item? This action cannot be undone.</p>

    </Dialog>
  </div>
}


export default AddTodo