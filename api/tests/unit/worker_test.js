import { ImportOrganizationLearnersJob } from '../../src/prescription/learner-management/infrastructure/jobs/ImportOrganizationLearnersJob.js';
import { ImportOrganizationLearnersJobHandler } from '../../src/prescription/learner-management/infrastructure/jobs/ImportOrganizationLearnersJobHandler.js';
import { ValidateOrganizationImportFileJob } from '../../src/prescription/learner-management/infrastructure/jobs/ValidateOrganizationImportFileJob.js';
import { ValidateOrganizationImportFileJobHandler } from '../../src/prescription/learner-management/infrastructure/jobs/ValidateOrganizationImportFileJobHandler.js';
import { config } from '../../src/shared/config.js';
import { runJobs } from '../../worker.js';
import { expect, sinon } from '../test-helper.js';

describe('#runjobs', function () {
  let startPgBossStub, createMonitoredJobQueueStub, scheduleCpfJobsStub, monitoredJobQueueStub;

  beforeEach(function () {
    const pgBossStub = { schedule: sinon.stub() };
    monitoredJobQueueStub = { performJob: sinon.stub() };
    startPgBossStub = sinon.stub();
    startPgBossStub.resolves(pgBossStub);
    createMonitoredJobQueueStub = sinon.stub();
    createMonitoredJobQueueStub.withArgs(pgBossStub).returns(monitoredJobQueueStub);
    scheduleCpfJobsStub = sinon.stub();
  });

  it('should register ImportOrganizationLearnersJob', async function () {
    //given
    sinon.stub(config.pgBoss, 'importFileJobEnabled').value(true);

    // when
    await runJobs({
      startPgBoss: startPgBossStub,
      createMonitoredJobQueue: createMonitoredJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    const calls = monitoredJobQueueStub.performJob
      .getCalls()
      .find(({ args }) => args[0] === ImportOrganizationLearnersJob.name);

    expect(calls.args[1]).to.equal(ImportOrganizationLearnersJobHandler);
  });

  it('should register ValidateOrganizationImportFileJob', async function () {
    //given
    sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

    // when
    await runJobs({
      startPgBoss: startPgBossStub,
      createMonitoredJobQueue: createMonitoredJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    const calls = monitoredJobQueueStub.performJob
      .getCalls()
      .find(({ args }) => args[0] === ValidateOrganizationImportFileJob.name);

    expect(calls.args[1]).to.equal(ValidateOrganizationImportFileJobHandler);
  });

  it('should not register validation job if PGBOSS_VALIDATION_FILE_JOB_ENABLED is false', async function () {
    //given
    sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);
    // when
    await runJobs({
      startPgBoss: startPgBossStub,
      createMonitoredJobQueue: createMonitoredJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    const calls = monitoredJobQueueStub.performJob.getCalls();

    const validatationJob = calls.find(({ args }) => args[0] === ValidateOrganizationImportFileJob.name);
    const importJob = calls.find(({ args }) => args[0] === ImportOrganizationLearnersJob.name);

    expect(validatationJob).to.be.undefined;
    expect(importJob).to.exist;
  });

  it('should not register import job if PGBOSS_IMPORT_FILE_JOB_ENABLED is false', async function () {
    //given
    sinon.stub(config.pgBoss, 'importFileJobEnabled').value(false);
    // when
    await runJobs({
      startPgBoss: startPgBossStub,
      createMonitoredJobQueue: createMonitoredJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    const calls = monitoredJobQueueStub.performJob.getCalls();

    const validatationJob = calls.find(({ args }) => args[0] === ValidateOrganizationImportFileJob.name);
    const importJob = calls.find(({ args }) => args[0] === ImportOrganizationLearnersJob.name);

    expect(validatationJob).to.exist;
    expect(importJob).to.be.undefined;
  });
});
