import { expect } from 'chai';
import sinon from 'sinon';

import { PgBossStatesMonitoringJobController } from '../../../../../src/shared/application/jobs/pgboss-states-monitoring.job-controller.js';

describe('Unit | Shared | Application | Jobs | PgBossStatesMonitoringJobController', function () {
  let logger;

  beforeEach(function () {
    logger = { info: sinon.stub() };
  });

  it('logs stats of each queue and a global aggregate', async function () {
    // given
    const capturedOn = new Date('2026-11-09T10:00:00Z');
    const deltaOn = new Date('2026-11-09T09:59:50Z');
    const jobClient = {
      getQueuesStats: sinon.stub().resolves([
        {
          name: 'FirstJob',
          deferredCount: 2,
          queuedCount: 5,
          readyCount: 3,
          activeCount: 2,
          failedCount: 1,
          totalCount: 10,
          completedDelta: 4,
          failedDelta: 1,
          createdDelta: 6,
          deltaSeconds: 60,
          deltaOn,
          waitBins: [1, 2, 3],
          runBins: [4, 5, 6],
          readyOldestSeconds: 12,
          percentiles: [
            { p: 50, waitSeconds: 1, runSeconds: 2 },
            { p: 95, waitSeconds: 3, runSeconds: 4 },
            { p: 99, waitSeconds: 5, runSeconds: 6 },
          ],
          capturedOn,
        },
        {
          name: 'SecondJob',
          deferredCount: 0,
          queuedCount: 1,
          readyCount: 1,
          activeCount: 0,
          failedCount: 0,
          totalCount: 3,
          completedDelta: null,
          failedDelta: null,
          createdDelta: null,
          deltaSeconds: null,
          deltaOn: null,
          waitBins: null,
          runBins: null,
          readyOldestSeconds: 40,
          percentiles: [
            { p: 50, waitSeconds: null, runSeconds: null },
            { p: 95, waitSeconds: null, runSeconds: null },
            { p: 99, waitSeconds: null, runSeconds: null },
          ],
          capturedOn,
        },
      ]),
    };

    // when
    await new PgBossStatesMonitoringJobController().handle({ dependencies: { logger, jobClient } });

    // then
    expect(logger.info.args).to.deep.equal([
      [
        {
          event: 'pg-boss-queue-stats',
          queue: 'FirstJob',
          stats: {
            deferredCount: 2,
            queuedCount: 5,
            readyCount: 3,
            activeCount: 2,
            failedCount: 1,
            totalCount: 10,
            completedDelta: 4,
            failedDelta: 1,
            createdDelta: 6,
            deltaSeconds: 60,
            deltaOn,
            readyOldestSeconds: 12,
            capturedOn,
            waitP50Seconds: 1,
            runP50Seconds: 2,
            waitP95Seconds: 3,
            runP95Seconds: 4,
            waitP99Seconds: 5,
            runP99Seconds: 6,
          },
        },
        'PGBOSS QUEUE STATS',
      ],
      [
        {
          event: 'pg-boss-queue-stats',
          queue: 'SecondJob',
          stats: {
            deferredCount: 0,
            queuedCount: 1,
            readyCount: 1,
            activeCount: 0,
            failedCount: 0,
            totalCount: 3,
            completedDelta: null,
            failedDelta: null,
            createdDelta: null,
            deltaSeconds: null,
            deltaOn: null,
            readyOldestSeconds: 40,
            capturedOn,
            waitP50Seconds: null,
            runP50Seconds: null,
            waitP95Seconds: null,
            runP95Seconds: null,
            waitP99Seconds: null,
            runP99Seconds: null,
          },
        },
        'PGBOSS QUEUE STATS',
      ],
      [
        {
          event: 'pg-boss-queue-stats',
          queue: 'global',
          stats: {
            deferredCount: 2,
            queuedCount: 6,
            readyCount: 4,
            activeCount: 2,
            failedCount: 1,
            totalCount: 13,
            completedDelta: 4,
            failedDelta: 1,
            createdDelta: 6,
            readyOldestSeconds: 40,
          },
        },
        'PGBOSS QUEUE STATS',
      ],
    ]);
  });

  it('logs null global deltas when no queue has deltas', async function () {
    // given
    const jobClient = {
      getQueuesStats: sinon.stub().resolves([
        {
          name: 'FirstJob',
          deferredCount: 0,
          queuedCount: 1,
          readyCount: 1,
          activeCount: 0,
          failedCount: 0,
          totalCount: 1,
          completedDelta: null,
          failedDelta: null,
          createdDelta: null,
          deltaSeconds: null,
          deltaOn: null,
          readyOldestSeconds: null,
          percentiles: [
            { p: 50, waitSeconds: null, runSeconds: null },
            { p: 95, waitSeconds: null, runSeconds: null },
            { p: 99, waitSeconds: null, runSeconds: null },
          ],
          capturedOn: new Date('2026-11-09T10:00:00Z'),
        },
      ]),
    };

    // when
    await new PgBossStatesMonitoringJobController().handle({ dependencies: { logger, jobClient } });

    // then
    expect(logger.info.lastCall.args[0].stats).to.deep.equal({
      deferredCount: 0,
      queuedCount: 1,
      readyCount: 1,
      activeCount: 0,
      failedCount: 0,
      totalCount: 1,
      completedDelta: null,
      failedDelta: null,
      createdDelta: null,
      readyOldestSeconds: null,
    });
  });
});
