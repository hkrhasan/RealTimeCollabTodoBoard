import { userCreateSchema } from "../schemas/user.schema";
import BaseController from "./base.controller";
import userRepository from "../repositories/user.repository";
import { ZodError } from "zod";

export default class UserController extends BaseController {
  async post() {
    try {
      const dto = userCreateSchema.parse(this.httpContext.request.body)

      const user = await userRepository.create(dto)

      this.httpContext.response.json({ _id: user._id })
    } catch (error) {
      console.error(error);
      let message = "something went wrong";
      let status = 500;

      if (error instanceof ZodError) {
        status = 400;
        message = JSON.parse(error.message);
      }

      if ((error as Error).name === 'MongoServerError' && (error as any).code === 11000) {
        status = 401
        message = "Email already in use"
      }

      this.httpContext.response.status(status).json({ error: message });

    }
  }

}