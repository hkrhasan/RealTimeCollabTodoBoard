import mongoose, { Types } from "mongoose";
import { IColumn, ColumnModel, ITask } from "../models";
import { TaskCreateWithoutBoardId, TaskUpdate } from "../schemas/task.schema";
import { BaseRepository } from "./base.repository";
import { ConflictError } from "../utils/conflict-error";
import userRepository from "./user.repository";

class ColumnRepository extends BaseRepository<IColumn> {
  constructor() {
    super(ColumnModel);
  }



  async addTask(dto: TaskCreateWithoutBoardId): Promise<any> {
    const { columnId, ...task } = dto;

    const column = await this.model.findById(columnId);
    if (!column) throw new Error('Column not found');

    const taskWithId = { ...task, _id: new mongoose.Types.ObjectId(), assignedTo: null, version: 0 }

    column.tasks.push(taskWithId);

    await column.save();

    return taskWithId;
  }


  async updateTask(dto: Omit<TaskUpdate, 'boardId' | 'broadCast'>, onAssign?: (data: { new: string | null; old: string | null }) => void) {
    const { columnId, taskId, overwrite, ...updates } = dto;
    const newAssignee = updates.assignedTo;

    const column = await this.model.findById(columnId);
    if (!column) throw new Error('Column not found');

    // Type assertion for tasks array
    const tasksArray = column.tasks as unknown as Types.DocumentArray<ITask>;
    const task = tasksArray.id(taskId) as ITask;

    if (!task) throw new Error('Task not found');

    if (task.version !== updates.version && !overwrite) {
      console.log("received version", updates.version)
      const user = task.assignedTo ? (await userRepository.findById(task.assignedTo, { select: '_id username' }))?.toObject() : null;
      throw new ConflictError('task version missmatch', { ...task.toObject(), assignedTo: { ...user } })
    }

    const oldAssignee = task.assignedTo;
    // Apply updates
    Object.assign(task, { ...updates, version: updates.version + 1 });

    await column.save();

    if (newAssignee && onAssign) onAssign({ new: newAssignee, old: oldAssignee })
    return task;
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