const {Router} = require('express');

function createMetricsRouter(adapter)
{
    const router = Router();

    router.get('/metrics', async (_req, res) => {
        res.set('Content-type', 'text/plain');
        res.send(await adapter.getMetrics());
    });

    return router;
}

module.exports = {createMetricsRouter}