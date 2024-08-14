import { JobPgBoss as Job } from '../../../../../src/shared/infrastructure/jobs/JobPgBoss.js';
import { expect, knex } from '../../../../test-helper.js';
import { jobs } from '../../../../tooling/jobs/expect-job.js';

describe('Integration | Infrastructure | Jobs | JobPgBoss', function () {
  it('schedule a job and create in db with given config', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = { jobParam: 1 };
    const retryLimit = 2;
    const retryDelay = 10;
    const retryBackoff = true;
    const expireIn = '00:00:30';
    const priority = 1;

    const job = new Job({ name, retryLimit, retryDelay, retryBackoff, expireIn, priority }, knex);

    // when
    await job.schedule(expectedParams);

    const result = await jobs(name)
      .select(knex.raw(`priority, retrylimit, retrydelay, retrybackoff, data, expirein::varchar`))
      .first();

    // then
    expect(result).to.deep.contains({
      data: expectedParams,
      expirein: expireIn,
      priority,
      retrydelay: retryDelay,
      retrylimit: retryLimit,
      retrybackoff: retryBackoff,
    });
  });
});
