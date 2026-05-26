import metrics from 'datadog-metrics';
import nock from 'nock';

import { DatadogMetrics } from '../../../../../src/shared/infrastructure/metrics/datadog-metrics.js';
import { expect } from '../../../../test-helper.js';

describe('Integration | Monitoring | Infrastructure | Datadog metrics', function () {
  describe('constructor', function () {
    describe('when isDirectMetricsEnabled is false', function () {
      it('should not send metrics to Datadog', async function () {
        // given
        process.env.DATADOG_SITE = 'datadog_fake.com';
        process.env.DATADOG_API_KEY = 'API_KEY';
        process.env.DEBUG = 'metrics';

        const config = { metrics: { isDirectMetricsEnabled: false }, infra: { containerName: 'web-1' } };
        nock('https://api.datadog_fake.com').post('/api/v1/series').reply(200);

        // when
        const m = new DatadogMetrics({ config });
        m.addMetricPoint({ type: 'histogram', name: 'test', value: 1 });
        await metrics.flush();

        //then
        expect(nock.isDone()).to.be.false;
      });
    });

    describe('when isDirectMetricsEnabled is true', function () {
      it('should send metrics to Datadog', async function () {
        // given
        process.env.DATADOG_SITE = 'datadog_fake.com';
        process.env.DATADOG_API_KEY = 'API_KEY';
        process.env.DEBUG = 'metrics';

        const config = { metrics: { isDirectMetricsEnabled: true }, infra: { containerName: 'web-1' } };
        nock('https://api.datadog_fake.com').post('/api/v1/series').reply(200);

        // when
        const m = new DatadogMetrics({ config });
        m.addMetricPoint({ type: 'histogram', name: 'test', value: 1 });
        await metrics.flush();

        //then
        expect(nock.isDone()).to.be.true;
      });
    });
  });
});
