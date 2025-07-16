
export interface JWTPayload {
  sub: string;
  email: string;
  username?: string;
}

declare global {
  namespace Express {
    interface Request {
      user: JWTPayload;
    }
  }
}