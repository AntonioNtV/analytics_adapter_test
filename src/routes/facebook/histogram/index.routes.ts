import { Router } from 'express';
import GetFacebookInteractionsHistogramService from '../../../services/facebook/GetFacebookInteractionsHistogramService';

const facebookHistogramRoutes = Router();

facebookHistogramRoutes.post('/interactions', async (request, response) => {
    const { since, until, timezone } = request.query;
    const { profile_ids } = request.body;

    const getHistogram = new GetFacebookInteractionsHistogramService();

    const data = await getHistogram.execute({
        since: String(since),
        until: String(until),
        profile_ids,
        timezone: String(timezone),
    });

    return response.json(data);
});

export default facebookHistogramRoutes;
