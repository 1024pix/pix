import { expect } from 'chai';

import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import {
  CORRELATION_METADATA,
  EMPTY_CORRELATION_INFO,
  executeInContext,
  EXECUTORS,
} from '../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { JobExpireIn, JobPriority, JobRetry } from '../../../../../../src/shared/infrastructure/jobs/default-config.js';
import { JobClient } from '../../../../../../src/shared/infrastructure/jobs/JobClient.js';
import { JobRepository } from '../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Infrastructure | Repositories | Jobs | job-repository', function () {
  beforeEach(async function () {
    await JobClient.instance.registerJob('JobTest');
  });

  it('create one job db with given config', async function () {
    // given
    const name = 'JobTest';
    const retry = JobRetry.STANDARD_RETRY;
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retry, priority });

    // when
    await job.performAsync({ jobParam: 1 });
    const expectedPayload = { jobParam: 1, correlationContext: EMPTY_CORRELATION_INFO };

    await expect(name).to.have.been.performed.withJob({
      name,
      data: expectedPayload,
      expireIn: 20 * 3600,
      priority,
      retryDelay: 30,
      retryLimit: 10,
      retryBackoff: true,
    });
  });

  it('create one job even without payload', async function () {
    // given
    const name = 'JobTest';
    const retry = JobRetry.STANDARD_RETRY;
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retry, priority });

    // when
    await job.performAsync();

    await expect(name).to.have.been.performed.withJob({
      name,
      data: {
        correlationContext: {
          jobId: null,
          'pix-metadata': null,
          request_id: null,
          scriptId: null,
          user_id: null,
        },
      },
      expireIn: 20 * 3600,
      priority,
      retryDelay: 30,
      retryLimit: 10,
      retryBackoff: true,
    });
  });

  it('creates one job and attach current correlation context', async function () {
    // given
    const context = {
      request: {
        headers: { 'x-request-id': 'someRequestId' },
        auth: { credentials: { userId: 456 } },
      },
      scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02 ',
      [CORRELATION_METADATA]: {
        foo: 'bar',
      },
    };
    const name = 'JobTest';
    const expectedCorrelationContext = {
      user_id: 456,
      request_id: 'someRequestId',
      scriptId: 'efcde830-e562-41d6-a721-4157ba9a9b02 ',
      jobId: null,
      [CORRELATION_METADATA]: {
        foo: 'bar',
      },
    };
    const expectedParams = { jobParam: 1, correlationContext: expectedCorrelationContext };
    const retry = JobRetry.STANDARD_RETRY;
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retry, priority });

    // when
    await executeInContext(
      context,
      async () => {
        return await job.performAsync(expectedParams);
      },
      EXECUTORS.REQUEST,
    );

    await expect(name).to.have.been.performed.withJob({
      name,
      data: expectedParams,
      expireIn: 20 * 3600,
      priority,
      retryDelay: 30,
      retryLimit: 10,
      retryBackoff: true,
    });
  });

  it('return job Id', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = { jobParam: 1 };
    const retry = JobRetry.STANDARD_RETRY;
    const expireIn = JobExpireIn.INFINITE;
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retry, expireIn, priority });

    // when
    const jobIdInserted = await job.performAsync(expectedParams);

    // then
    expect(jobIdInserted).to.match(new RegExp('^[0-z]{8}-[0-z]{4}-[0-z]{4}-[0-z]{4}-[0-z]{12}$'));
  });

  describe('JobExpireIn', function () {
    it('reject unexpected expiredIn value', async function () {
      // given
      const expireIn = '00:00:00';

      // when
      const error = catchErrSync(({ expireIn }) => new JobRepository({ expireIn }))({ expireIn });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes).to.deep.equal([
        {
          attribute: 'expireIn',
          message: `"expireIn" accept only JobExpireIn value such as ${Object.keys(JobExpireIn).join(', ')}`,
        },
      ]);
    });
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
          message: `"priority" accept only JobPriority value such as ${Object.keys(JobPriority).join(', ')}`,
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
          message: `"retry" accept only JobRetry value such as ${Object.keys(JobRetry).join(', ')}`,
        },
      ]);
    });
  });
});
