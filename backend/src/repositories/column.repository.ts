import mongoose from "mongoose";
import { IColumn, ColumnModel, ITask } from "../models";
import { TaskCreateWithoutBoardId } from "../schemas/task.schema";
import { BaseRepository } from "./base.repository";

class ColumnRepository extends BaseRepository<IColumn> {
  constructor() {
    super(ColumnModel);
  }

  async addTask(dto: TaskCreateWithoutBoardId): Promise<any> {
    const { columnId, ...task } = dto;

    const column = await this.model.findById(columnId);
    if (!column) throw new Error('Column not found');

    const taskWithId = { ...task, _id: new mongoose.Types.ObjectId(), assignedTo: null }

    column.tasks.push(taskWithId);

    await column.save();

    return taskWithId;
  }


  async findColumnAndTaskById(columnId: string, taskId: string) {
    const column = await this.model.findById(columnId);

    if (!column) throw new Error("Column not found");
    const taskIndex = column.tasks.findIndex(t => (t as ITask)._id?.toString() === taskId)

    if (taskIndex === -1) throw new Error('Task not found')

    return { column, task: column.tasks[taskIndex], taskIndex }
  }
}


export default new ColumnRepository();