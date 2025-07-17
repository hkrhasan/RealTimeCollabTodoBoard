import BaseController from "./base.controller";
import actionRepository from "../repositories/action.repository";

export default class ActivityController extends BaseController {

  async get() {
    try {
      const actions = await actionRepository.findWithUsersAndTask({}, {
        limit: 20,
        sort: {
          createdAt: -1
        }
      })

      this.httpContext.response.status(200).json(actions)
    } catch (error) {
      console.error(error);
      let message = "something went wrong";
      let status = 500;
      this.httpContext.response.status(status).json({ error: message });
    }
  }

}