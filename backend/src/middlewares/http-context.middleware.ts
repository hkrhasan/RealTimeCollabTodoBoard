import { NextFunction, Request, Response } from "express";
import HttpContext from "../contexts/http.context";

export const httpContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.httpContext = new HttpContext(req, res)
  next();
}

declare global {
  namespace Express {
    interface Request {
      httpContext: HttpContext;
    }
  }
}