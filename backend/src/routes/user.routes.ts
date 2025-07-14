import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

router.post("/", (req) => new UserController(req.httpContext).post())

export default router;