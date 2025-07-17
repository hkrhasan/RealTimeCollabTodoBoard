import { FilterQuery } from "mongoose";
import { IAction, ActionModel } from "../models";
import { BaseRepository, FindOptions } from "./base.repository";

class ActionRepository extends BaseRepository<IAction> {
  constructor() {
    super(ActionModel);
  }

  async findWithUsersAndTask(
    filter: FilterQuery<IAction> = {},
    options: FindOptions = {}
  ) {
    let query = this.model.find(filter);

    if (options.sort) {
      query = query.sort(options.sort);
    }
    if (options.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }

    return query.exec();

    // return query.populate({
    //   path: 'who what'
    // }).exec()
  }
}


export default new ActionRepository();