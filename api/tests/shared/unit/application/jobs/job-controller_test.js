import { JobController, JobGroup } from '../../../../../src/shared/application/jobs/job-controller.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { JobExpireIn } from '../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Shared | Application | Jobs | JobController', function () {
  it('should require a job name', async function () {
    // given
    const jobName = null;

    // when
    const error = catchErrSync((jobName) => new JobController(jobName))(jobName);

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });

  it('should require a valid job group', async function () {
    // given
    const jobGroup = 'is-invalid-group';

    // when
    const error = catchErrSync((jobGroup) => new JobController('jobName', { jobGroup }))(jobGroup);

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });

  it('should create a JobController', async function () {
    // given
    const jobName = 'jobName';
    const jobGroup = JobGroup.DEFAULT;
    const expireIn = JobExpireIn.INFINITE;

    // when
    const controller = new JobController(jobName);

    // then
    expect(controller).to.be.instanceOf(JobController).and.to.deep.equal({
      jobName,
      jobGroup,
      expireIn,
    });
  });

  it('should set isJobEnabled to true by default', function () {
    // when
    const controller = new JobController('jobName');

    // then
    expect(controller.isJobEnabled).to.be.true;
  });

  it('should set legacyName to null by default', function () {
    // when
    const controller = new JobController('jobName');

    // then
    expect(controller.legacyName).to.be.null;
  });
});
