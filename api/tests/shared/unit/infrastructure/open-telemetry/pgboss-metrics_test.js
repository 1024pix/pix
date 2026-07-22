import { metrics } from '@opentelemetry/api';
import sinon from 'sinon';

import { registerPgBossMetrics } from '../../../../../src/shared/infrastructure/open-telemetry/job-tracing.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Infrastructure | Open Telemetry | pgboss-metrics', function () {
  let instrumentsByName;

  beforeEach(function () {
    instrumentsByName = {};
    const meterStub = {
      createObservableGauge: sinon.stub().callsFake((name) => {
        instrumentsByName[name] = { addCallback: sinon.stub() };
        return instrumentsByName[name];
      }),
    };
    sinon.stub(metrics, 'getMeter').returns(meterStub);
  });

  afterEach(function () {
    metrics.getMeter.restore();
  });

  it('registers an observable gauge for queue job counts per state', async function () {
    // given
    const jobClient = {
      getQueuesStats: sinon.stub().resolves({
        global: { created: 999 },
        FirstJob: { created: 1, retry: 2, active: 3, completed: 4, cancelled: 5, failed: 6 },
      }),
      getOldestPendingJobAges: sinon.stub().resolves([]),
    };
    const observe = sinon.stub();

    // when
    registerPgBossMetrics(jobClient);
    const callback = instrumentsByName['pgboss.queue.jobs'].addCallback.firstCall.args[0];
    await callback({ observe });

    // then
    expect(observe).to.have.been.calledWith(1, { 'pgboss.queue.name': 'FirstJob', 'pgboss.job.state': 'created' });
    expect(observe).to.have.been.calledWith(2, { 'pgboss.queue.name': 'FirstJob', 'pgboss.job.state': 'retry' });
    expect(observe).to.have.been.calledWith(3, { 'pgboss.queue.name': 'FirstJob', 'pgboss.job.state': 'active' });
    expect(observe).to.have.been.calledWith(5, { 'pgboss.queue.name': 'FirstJob', 'pgboss.job.state': 'cancelled' });
    expect(observe).to.have.been.calledWith(6, { 'pgboss.queue.name': 'FirstJob', 'pgboss.job.state': 'failed' });
    expect(observe).to.not.have.been.calledWith(sinon.match.any, sinon.match({ 'pgboss.queue.name': 'global' }));
  });

  it('registers an observable gauge for the oldest pending job age per queue', async function () {
    // given
    const jobClient = {
      getQueuesStats: sinon.stub().resolves({}),
      getOldestPendingJobAges: sinon.stub().resolves([{ name: 'FirstJob', ageInSeconds: 120 }]),
    };
    const observe = sinon.stub();

    // when
    registerPgBossMetrics(jobClient);
    const callback = instrumentsByName['pgboss.queue.oldest_pending_job_age'].addCallback.firstCall.args[0];
    await callback({ observe });

    // then
    expect(observe).to.have.been.calledWith(120, { 'pgboss.queue.name': 'FirstJob' });
  });
});
