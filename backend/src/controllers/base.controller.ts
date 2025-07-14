import HttpContext from "../contexts/http.context";

export default abstract class BaseController {
  httpContext: HttpContext;

  constructor(httpContext: HttpContext) {
    this.httpContext = httpContext;
  }
}