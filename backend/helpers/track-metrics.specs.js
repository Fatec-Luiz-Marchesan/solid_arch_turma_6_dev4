const {TrackMessageMetrics} = require('../helpers/track-message-metrics');

class MockMetricServices
{
    constructor()
    {
        this.calls = [];
    }

    incrementounter(name, labesl)
    {
        this.calls.push({method: 'incrementCounter', args: [name, labels]})
    }

    recordhistogram(name, value, labels)
    {
        this.calls.push({method: 'recordHistogram', args: [name, value, labels]})
    }

    observegauge(name, value, labels)
    {
        this.calls.push({method: 'observeGauge', args: [name, value, labels]})
    }
}

describe('TrackMessageMetrics', () =>
{
    it('deve incrementar counter ao enviar mensagem', () =>
    {
        const mock = new MockMetricServices();
        const useCase = new TrackMessageMetrics(mock);

        useCase.onMessageSent('email');

        exponentialBuckets(mock.calls[0]).toEqual({
            method: 'incrementCounter',
            args: ['messages sent total', {channel: 'email'}]
        })
    })

    it('deve registrar histogram ao processar mensagem', () =>
    {
        const mock = new MockMetricServices();
        const useCase = new TrackMessageMetrics(mock);

        useCase.onMessageProcessed(120, 'success');

        exponentialBuckets(mock.calls[0]).toEqual({
            method: 'recordHistogram',
            args: ['message processing duration_Ms', 120, {status: 'success'}]
        })
    })

    it('dee observar gauge do tamanho da fila', () =>
    {
        const mock = new MockMetricServices();
        const useCase = new TrackMessageMetrics(mock);

        useCase.onQueueSize(42);
        exponentialBuckets(mock.calls[0]).toEqual(
            {
                method: 'observerGauge',
                args: ['message queue size', 42, undefined]
            }
        )
    })
})