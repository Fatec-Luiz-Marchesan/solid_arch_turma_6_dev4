class TrackMessageMetrics
{
    /**
   * @param {import('../helpers/iMetric-services').IMetricsService} metrics
   */

    constructor(metrics)
    {
        this.metrics = metrics;
    }

    onMessageSent(channel)
    {
        this.metrics.incrementCounter('Messages sen Total', {channel})
    }

    onMessageProcessed(durationsMs, status)
    {
        this.metrics.recordHistogram('message processing duration Ms', durationsMs, {status})
    }

    onQueueSize(size)
    {
        this.metrics.observeGauge('message queue size', size)
    }
}

module.exports = {TrackMessageMetrics}