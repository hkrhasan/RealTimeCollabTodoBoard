import { Router } from "express";
import ActivityController from "../controllers/activity.controller";

const router = Router();

router.get("/", (req) => new ActivityController(req.httpContext).get())

export default router;