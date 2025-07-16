import { NextFunction, Request, Response } from "express";
import { JWTPayload } from "../types/jwt-payload";
import { ExtendedError, Socket } from "socket.io";
import authService from "../services/auth.service";

export function authenticate() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!await req.httpContext.identity.authenticate()) {
      res.status(401).json({ error: "UnAuthorized" });
      return;
    }

    next();
  }
}

export function authenticateSocket() {
  return async (socket: Socket, next: (err?: ExtendedError) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication token missing"));
    try {
      const payload = authService.verifyToken(token);
      socket.data.user = payload;
      return next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      user: JWTPayload;
    }
  }
}

declare global {
  namespace Socket {
    interface SocketData {
      user: JWTPayload;
    }
  }
}