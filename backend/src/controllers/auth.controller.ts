import { ZodError } from "zod";
import { userLoginSchema } from "../schemas/user.schema";
import BaseController from "./base.controller";
import userRepository from "../repositories/user.repository";
import authService from "../services/auth.service";

export default class AuthController extends BaseController {
  async login() {
    try {
      const dto = userLoginSchema.parse(this.httpContext.request.body)
      const user = await userRepository.findByEmail(dto.email);

      const isValid = await user.comparePassword(dto.password);

      if (!isValid) {
        this.httpContext.response.status(401).json({ error: "Invalid Credentials" })
      }

      const { accessToken, refreshToken } = await authService.signTokens({
        email: user.email,
        sub: user._id.toString(),
      })

      this.httpContext.response.json({ accessToken, refreshToken, username: user.username })
    } catch (error) {
      console.error(error);
      let message = "something went wrong";
      let status = 500;

      if (error instanceof ZodError) {
        status = 400;
        message = JSON.parse(error.message);
      }

      this.httpContext.response.status(status).json({ error: message });
    }
  }

}