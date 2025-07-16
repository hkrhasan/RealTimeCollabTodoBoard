import { Router } from "express";
import UserController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", (req) => new UserController(req.httpContext).post())
router.get("/", authenticate(), (req) => new UserController(req.httpContext).get())

export default router;