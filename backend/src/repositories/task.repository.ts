import { ITask, TaskModel } from "../models";
import { BaseRepository } from "./base.repository";

class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(TaskModel);
  }
}


export default new TaskRepository();