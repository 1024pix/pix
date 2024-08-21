import { UserAnonymizedEventLoggingJob } from '../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { ValidateOrganizationLearnersImportFileJobController } from '../../src/prescription/learner-management/application/jobs/validate-organization-learners-import-file-job-controller.js';
import { ValidateOrganizationImportFileJob } from '../../src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { UserAnonymizedEventLoggingJobController } from '../../src/shared/application/jobs/audit-log/user-anonymized-event-logging-job-controller.js';
import { config } from '../../src/shared/config.js';
import { registerJobs } from '../../worker.js';
import { expect, sinon } from '../test-helper.js';

describe('#registerJobs', function () {
  let startPgBossStub, createJobQueueStub, scheduleCpfJobsStub, jobQueueStub;

  beforeEach(function () {
    const pgBossStub = { schedule: sinon.stub() };
    jobQueueStub = { registerJob: sinon.stub() };
    startPgBossStub = sinon.stub();
    startPgBossStub.resolves(pgBossStub);
    createJobQueueStub = sinon.stub();
    createJobQueueStub.withArgs(pgBossStub).returns(jobQueueStub);
    scheduleCpfJobsStub = sinon.stub();
  });

  it('should register UserAnonymizedEventLoggingJob', async function () {
    // when
    await registerJobs({
      startPgBoss: startPgBossStub,
      createJobQueue: createJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    expect(jobQueueStub.registerJob).to.have.been.calledWithExactly(
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
      createJobQueue: createJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    expect(jobQueueStub.registerJob).to.have.been.calledWithExactly(
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
      createJobQueue: createJobQueueStub,
      scheduleCpfJobs: scheduleCpfJobsStub,
    });

    // then
    expect(jobQueueStub.registerJob).to.not.have.been.calledWithExactly(
      ValidateOrganizationImportFileJob.name,
      ValidateOrganizationLearnersImportFileJobController,
    );
  });
});
