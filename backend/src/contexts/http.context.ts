import { Request, Response } from "express";
import IdentityContext from "./identity.context";

export default class HttpContext {
  private _request: Request;
  private _response: Response;
  identity: IdentityContext;

  constructor(request: Request, response: Response) {
    this._request = request;
    this._response = response;
    this.identity = new IdentityContext(request, response);
  }

  get request(): Request {
    return this._request;
  }

  get response(): Response {
    return this._response;
  }
}