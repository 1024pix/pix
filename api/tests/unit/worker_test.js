import { UserAnonymizedEventLoggingJob } from '../../src/identity-access-management/domain/models/UserAnonymizedEventLoggingJob.js';
import { ValidateOrganizationLearnersImportFileJobController } from '../../src/prescription/learner-management/application/jobs/validate-organization-learners-import-file-job-controller.js';
import { ValidateOrganizationImportFileJob } from '../../src/prescription/learner-management/domain/models/ValidateOrganizationImportFileJob.js';
import { UserAnonymizedEventLoggingJobController } from '../../src/shared/application/jobs/audit-log/user-anonymized-event-logging-job-controller.js';
import { JobGroup } from '../../src/shared/application/jobs/job-controller.js';
import { config } from '../../src/shared/config.js';
import { registerJobs } from '../../worker.js';
import { catchErr, expect, sinon } from '../test-helper.js';

describe('#registerJobs', function () {
  let startPgBossStub, createJobQueuesStub, scheduleCpfJobsStub, jobQueueStub;

  beforeEach(function () {
    const pgBossStub = { schedule: sinon.stub() };
    jobQueueStub = { register: sinon.stub() };
    startPgBossStub = sinon.stub();
    startPgBossStub.resolves(pgBossStub);
    createJobQueuesStub = sinon.stub();
    createJobQueuesStub.withArgs(pgBossStub).returns(jobQueueStub);
    scheduleCpfJobsStub = sinon.stub();
  });

  it('should register UserAnonymizedEventLoggingJob', async function () {
    // when
    await registerJobs({
      jobGroup: JobGroup.DEFAULT,
      dependencies: {
        startPgBoss: startPgBossStub,
        createJobQueues: createJobQueuesStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      },
    });

    // then
    expect(jobQueueStub.register).to.have.been.calledWithExactly(
      UserAnonymizedEventLoggingJob.name,
      UserAnonymizedEventLoggingJobController,
    );
  });

  it('should register ValidateOrganizationImportFileJob when job is enabled', async function () {
    //given
    sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(true);

    // when
    await registerJobs({
      jobGroup: JobGroup.DEFAULT,
      dependencies: {
        startPgBoss: startPgBossStub,
        createJobQueues: createJobQueuesStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      },
    });

    // then
    expect(jobQueueStub.register).to.have.been.calledWithExactly(
      ValidateOrganizationImportFileJob.name,
      ValidateOrganizationLearnersImportFileJobController,
    );
  });

  it('should not register ValidateOrganizationImportFileJob when job is disabled', async function () {
    //given
    sinon.stub(config.pgBoss, 'validationFileJobEnabled').value(false);

    // when
    await registerJobs({
      jobGroup: JobGroup.DEFAULT,
      dependencies: {
        startPgBoss: startPgBossStub,
        createJobQueues: createJobQueuesStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      },
    });

    // then
    expect(jobQueueStub.register).to.not.have.been.calledWithExactly(
      ValidateOrganizationImportFileJob.name,
      ValidateOrganizationLearnersImportFileJobController,
    );
  });

  it('should throws an error when group is invalid', async function () {
    // given
    const error = await catchErr(registerJobs)({
      dependencies: {
        startPgBoss: startPgBossStub,
        createJobQueues: createJobQueuesStub,
        scheduleCpfJobs: scheduleCpfJobsStub,
      },
    });

    // then
    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.equal(`Job group invalid, allowed Job groups are [${Object.values(JobGroup)}]`);
  });
});
