import { Router } from 'express';
import facebookHistogramRoutes from './histogram/index.routes';

const facebookRouter = Router();

facebookRouter.use('/histogram', facebookHistogramRoutes);

export default facebookRouter;
