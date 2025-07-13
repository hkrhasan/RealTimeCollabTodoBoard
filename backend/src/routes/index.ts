import { Application, Request, Response } from 'express';


export const registerRoutes = (app: Application) => {
  app.get('/', (_: Request, res: Response) => {
    res.send('Application works!');
  });
}