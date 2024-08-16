import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { JobPgBoss as Job } from '../../../../../src/shared/infrastructure/jobs/JobPgBoss.js';
import { JobPriority } from '../../../../../src/shared/infrastructure/jobs/JobPriority.js';
import { catchErrSync, expect, knex } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Jobs | JobPgBoss', function () {
  it('create one job db with given config', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = { jobParam: 1 };
    const retryLimit = 2;
    const retryDelay = 10;
    const retryBackoff = true;
    const expireIn = '00:00:30';
    const priority = JobPriority.HIGH;

    const job = new Job({ name, retryLimit, retryDelay, retryBackoff, expireIn, priority }, knex);

    // when
    await job.performAsync(expectedParams);

    await expect(name).to.have.been.performed.withJob({
      name,
      data: expectedParams,
      expirein: expireIn,
      priority,
      retrydelay: retryDelay,
      retrylimit: retryLimit,
      retrybackoff: retryBackoff,
    });
  });

  it('create jobs db with given config', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = [{ jobParam: 1 }, { jobParam: 2 }];
    const retryLimit = 2;
    const retryDelay = 10;
    const retryBackoff = true;
    const expireIn = '00:00:30';
    const priority = JobPriority.HIGH;

    const job = new Job({ name, retryLimit, retryDelay, retryBackoff, expireIn, priority }, knex);

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

    const job = new Job({ name, retryLimit, retryDelay, retryBackoff, expireIn, priority });

    // when
    const jobsInserted = await job.performAsync(...expectedParams);

    // then
    expect(jobsInserted.rowCount).to.equal(2);
  });

  it('reject unexpected priority value', async function () {
    // given
    const priority = 999;

    // when
    const error = catchErrSync(({ priority }, knex) => new Job({ priority }, knex))({ priority }, knex);

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
