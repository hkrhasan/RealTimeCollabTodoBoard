import { Application, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

export const registerRoutes = (app: Application) => {
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.get('/', (_: Request, res: Response) => {
    res.send('Application works!');
  });
}