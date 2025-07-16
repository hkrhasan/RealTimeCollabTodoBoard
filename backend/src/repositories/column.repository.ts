import mongoose from "mongoose";
import { IColumn, ColumnModel, ITask } from "../models";
import { Task, TaskCreate, TaskCreateWithoutBoardId } from "../schemas/task.schema";
import { BaseRepository } from "./base.repository";

class ColumnRepository extends BaseRepository<IColumn> {
  constructor() {
    super(ColumnModel);
  }

  async addTask(dto: TaskCreateWithoutBoardId): Promise<any> {
    const { columnId, ...task } = dto;
    const taskWithId = { ...task, _id: new mongoose.Types.ObjectId() }
    const updatedColumn = await this.model.findOneAndUpdate(
      { _id: columnId },
      { $push: { tasks: taskWithId } },
      { new: true, runValidators: true }
    )

    if (!updatedColumn) throw new Error('Column not found');

    return taskWithId;
  }
}


export default new ColumnRepository();