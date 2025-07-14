import { Request, Response, NextFunction } from 'express'
import authService from "../services/auth.service";

export default class IdentityContext {
  private _request: Request;
  private _response: Response;
  user?: Record<string, string>;

  constructor(request: Request, response: Response) {
    this._request = request;
    this._response = response;
  }


  async authenticate(): Promise<boolean> {
    try {
      const authHeader = this._request.headers['authorization'];
      const authHeaderValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      const token = authHeaderValue?.split(" ")[1];
      if (!token) {
        return false;
      }
      this._request.user = authService.verifyToken(token);
      return true;
    } catch (error) {
      console.error(error)
      return false
    }
  }
}