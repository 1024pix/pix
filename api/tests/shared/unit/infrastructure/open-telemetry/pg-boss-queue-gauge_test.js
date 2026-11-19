import { AggregationType } from '@opentelemetry/sdk-metrics';
import { expect } from 'chai';

import { pgBossQueueGaugeViews } from '../../../../../src/shared/infrastructure/open-telemetry/pg-boss-queue-gauge.js';

describe('Shared | Unit | Infrastructure | OpenTelemetry | pg-boss-queue-gauge', function () {
  describe('#pgBossQueueGaugeViews', function () {
    it('keeps the gauge on the worker-1 container', function () {
      // when
      const views = pgBossQueueGaugeViews('worker-1');

      // then
      expect(views).to.deep.equal([]);
    });

    it('keeps the gauge outside Scalingo', function () {
      // when
      const views = pgBossQueueGaugeViews(undefined);

      // then
      expect(views).to.deep.equal([]);
    });

    ['web-1', 'web-12', 'worker-2', 'one-off-1234'].forEach((container) => {
      it(`drops the gauge on the ${container} container`, function () {
        // when
        const views = pgBossQueueGaugeViews(container);

        // then
        expect(views).to.deep.equal([
          { instrumentName: 'pgboss.queue.jobs', aggregation: { type: AggregationType.DROP } },
        ]);
      });
    });
  });
});
