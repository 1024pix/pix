import { JobPgBoss as Job } from '../../../../../src/shared/infrastructure/jobs/JobPgBoss.js';
import { expect, knex } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Jobs | JobPgBoss', function () {
  it('schedule a job and create in db with given config', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = { jobParam: 1 };
    const job = new Job({ name, retryLimit: 2, retryDelay: 10, retryBackoff: true, expireIn: '00:00:30' }, knex);

    // when
    await job.schedule(expectedParams);

    const result = await knex
      .select(knex.raw(`retrylimit, retrydelay, retrybackoff, data, expirein::varchar`))
      .from('pgboss.job')
      .where('name', 'JobTest')
      .first();

    // then
    expect(result.retrylimit).to.equal(2);
    expect(result.retrydelay).to.equal(10);
    expect(result.retrybackoff).to.equal(true);
    expect(result.expirein).to.equal('00:00:30');
    expect(result.data).to.deep.equal(expectedParams);
  });
});
