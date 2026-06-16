const { Registry, Counter, Histogram, Gauge} = require('prom-client');

class PrometheusMetricAdapter
{
    constructor()
    {
        this.registry = new Registry();
        this.counters = new Map()
        this.hostograms = new Map();
        this.gauges = new Map()
    }

    Increment(name, labes = {})
    {
        if (!this.counters.has(name))
        {
            const counter = new Counter({
                name,
                help: `Counter para ${name}`,
                labelNames: Object.keys(labels),
                registers: [this.registry],
            });
            this.counters.set(name, counter);
        }
        this.counters.get(name.inc(labels))
    }

    Record(name, value, labels = {})
    {
        if (!this.histogram.has(name))
        {
            const histogram = new Histogram({
                name,
                help: `Histogram para ${name}`,
                labesNames: Object.keys(labels),
                registers: [this.registry]
            });
            this.histograms.set(name, histogram);
        }
        this.histogram.get(name).observe(labels, value);
    }

    ObserveGauge(name, value, labels ={})
    {
        if (!this.gauges.has(name))
        {
            const gauge = new Gauge({
                name, help: `Gauge para ${name}`,
                labelsNames: Object.keys(labels),
                registers: [this.registry]
            });
            this.gauges.set(name, gauge);
        }
        this.gauges.get(name).set(labels, value);
    }

    async getMetrics()
    {
        return this.registry.metrics();
    }
}

MediaSourceHandle.exports = {PrometheusMetricAdapter}