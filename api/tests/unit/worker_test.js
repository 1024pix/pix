import { ImportOrganizationLearnersJob } from '../../src/prescription/learner-management/infrastructure/jobs/ImportOrganizationLearnersJob.js';
import { ImportOrganizationLearnersJobHandler } from '../../src/prescription/learner-management/infrastructure/jobs/ImportOrganizationLearnersJobHandler.js';
import { runJobs } from '../../worker.js';
import { expect, sinon } from '../test-helper.js';

describe('#runjobs', function () {
  it('should register ImportOrganizationLearnersJob', async function () {
    //given
    const pgBossStub = { schedule: sinon.stub() };
    const monitoredJobQueueStub = { performJob: sinon.stub() };
    const startPgBossStub = sinon.stub();
    startPgBossStub.resolves(pgBossStub);
    const createMonitoredJobQueueStub = sinon.stub();
    createMonitoredJobQueueStub.withArgs(pgBossStub).returns(monitoredJobQueueStub);
    const scheduleCpfJobsStub = sinon.stub();

    // when
    await runJobs({
      startPgBoss: startPgBossStub,
      createMonitoredJobQueue: createMonitoredJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    const call = monitoredJobQueueStub.performJob
      .getCalls()
      .find(({ args }) => args[0] === ImportOrganizationLearnersJob.name);

    expect(call.args[1]).to.equal(ImportOrganizationLearnersJobHandler);
  });
});
