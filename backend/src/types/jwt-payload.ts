
export interface JWTPayload {
  sub: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user: JWTPayload;
    }
  }
}