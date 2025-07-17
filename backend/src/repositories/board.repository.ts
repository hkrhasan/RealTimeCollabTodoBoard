import { populate } from "dotenv";
import { IBoard, BoardModel } from "../models";
import { BaseRepository } from "./base.repository";

class BoardRepository extends BaseRepository<IBoard> {
  constructor() {
    super(BoardModel);
  }

  async findByIdWithColumnAndTask(id: string) {
    return this.model.findById(id).populate({
      path: 'columns',
      populate: {
        path: 'tasks',
        populate: {
          path: 'assignedTo',
          select: '_id username',             // only bring back the username
          model: 'User',
        }
      }
    }).lean()
  }

  async exists(id: string) {
    return this.model.exists({ _id: id })
  }
}


export default new BoardRepository();