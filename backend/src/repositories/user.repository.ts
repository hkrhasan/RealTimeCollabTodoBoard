import { FilterQuery } from "mongoose";
import { IUser, UserModel } from "../models/user";
import { User } from "../schemas/user.schema";
import { BaseRepository } from "./base.repository";

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  async create(userData: User): Promise<IUser> {
    if (!userData.username) {
      userData.username = userData.email?.split("@")[0]
    }
    const user = new UserModel(userData);
    await user.save();
    return user;
  }


  async findByEmail(email: string): Promise<IUser> {
    const users = await this.find({ email });
    if (!users.length) throw new Error("User not found");
    return users[0]!;
  }
}


export default new UserRepository();