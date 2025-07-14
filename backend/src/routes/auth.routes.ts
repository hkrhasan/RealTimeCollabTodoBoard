import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/login", (req) => new AuthController(req.httpContext).login())

export default router;