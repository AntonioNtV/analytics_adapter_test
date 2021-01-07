import { Router } from 'express';
import facebookRouter from './facebook/index.routes';

const routes = Router();

routes.use('/facebook', facebookRouter);

export default routes;
