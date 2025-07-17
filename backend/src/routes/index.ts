import { Application, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import activityRoutes from './activity.routes'
import { authenticate } from '../middlewares/auth.middleware';


export const registerRoutes = (app: Application) => {
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/activities', authenticate(), activityRoutes)
  app.get('/', (_: Request, res: Response) => {
    res.send('Application works!');
  });
}