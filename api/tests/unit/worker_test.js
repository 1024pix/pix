import { UserAnonymizedEventLoggingJob } from '../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { ValidateOrganizationLearnersImportFileJobController } from '../../src/prescription/learner-management/application/jobs/validate-organization-learners-import-file-job-controller.js';
import { ValidateOrganizationImportFileJob } from '../../src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { UserAnonymizedEventLoggingJobController } from '../../src/shared/application/jobs/audit-log/user-anonymized-event-logging-job-controller.js';
import { config } from '../../src/shared/config.js';
import { registerJobs } from '../../worker.js';
import { expect, sinon } from '../test-helper.js';

describe('#registerJobs', function () {
  let startPgBossStub, createMonitoredJobQueueStub, scheduleCpfJobsStub, monitoredJobQueueStub;

  beforeEach(function () {
    const pgBossStub = { schedule: sinon.stub() };
    monitoredJobQueueStub = { registerJob: sinon.stub() };
    startPgBossStub = sinon.stub();
    startPgBossStub.resolves(pgBossStub);
    createMonitoredJobQueueStub = sinon.stub();
    createMonitoredJobQueueStub.withArgs(pgBossStub).returns(monitoredJobQueueStub);
    scheduleCpfJobsStub = sinon.stub();
  });

  it('should register UserAnonymizedEventLoggingJob', async function () {
    // when
    await registerJobs({
      startPgBoss: startPgBossStub,
      createMonitoredJobQueue: createMonitoredJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    expect(monitoredJobQueueStub.registerJob).to.have.been.calledWithExactly(
      UserAnonymizedEventLoggingJob.name,
      UserAnonymizedEventLoggingJobController,
    );
  });

  it('should register ValidateOrganizationImportFileJob when job is enabled', async function () {
    //given
    sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

    // when
    await registerJobs({
      startPgBoss: startPgBossStub,
      createMonitoredJobQueue: createMonitoredJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    expect(monitoredJobQueueStub.registerJob).to.have.been.calledWithExactly(
      ValidateOrganizationImportFileJob.name,
      ValidateOrganizationLearnersImportFileJobController,
    );
  });

  it('should not register ValidateOrganizationImportFileJob when job is disabled', async function () {
    //given
    sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

    // when
    await registerJobs({
      startPgBoss: startPgBossStub,
      createMonitoredJobQueue: createMonitoredJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    expect(monitoredJobQueueStub.registerJob).to.not.have.been.calledWithExactly(
      ValidateOrganizationImportFileJob.name,
      ValidateOrganizationLearnersImportFileJobController,
    );
  });
});
