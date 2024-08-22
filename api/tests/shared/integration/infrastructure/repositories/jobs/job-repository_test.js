import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import {
  JobPriority,
  JobRepository,
  JobRetry,
} from '../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Repositories | Jobs | job-repository', function () {
  it('create one job db with given config', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = { jobParam: 1 };
    const retry = JobRetry.STANDARD_RETRY;
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retry, priority });

    // when
    await job.performAsync(expectedParams);

    await expect(name).to.have.been.performed.withJob({
      name,
      data: expectedParams,
      expirein: '00:15:00',
      priority,
      retrydelay: 30,
      retrylimit: 10,
      retrybackoff: true,
    });
  });

  it('create jobs db with given config', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = [{ jobParam: 1 }, { jobParam: 2 }];
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, priority });

    // when
    await job.performAsync(...expectedParams);

    // then
    await expect(name).to.have.been.performed.withJobPayloads(expectedParams);
  });

  it('return inserted count jobs', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = [{ jobParam: 1 }, { jobParam: 2 }];
    const retryLimit = 2;
    const retryDelay = 10;
    const retryBackoff = true;
    const expireIn = '00:00:30';
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retryLimit, retryDelay, retryBackoff, expireIn, priority });

    // when
    const jobsInserted = await job.performAsync(...expectedParams);

    // then
    expect(jobsInserted.rowCount).to.equal(2);
  });

  describe('JobPriority', function () {
    it('reject unexpected priority value', async function () {
      // given
      const priority = 999;

      // when
      const error = catchErrSync(({ priority }) => new JobRepository({ priority }))({ priority });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([
        {
          attribute: 'priority',
          message: '"priority" must be one of [0, 1]',
        },
      ]);
    });
  });

  describe('JobRetry', function () {
    it('reject unexpected retry config', async function () {
      // given
      const retry = 'toto';

      // when
      const error = catchErrSync(({ retry }) => new JobRepository({ retry }))({ retry });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([
        {
          attribute: 'retry',
          message: `retry accept only JobRetry value such as ${Object.keys(JobRetry).join(', ')}`,
        },
      ]);
    });
  });
});
