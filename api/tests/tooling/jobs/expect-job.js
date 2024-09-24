import { assert, Assertion } from 'chai';

export const jobChai = (knex) => (_chai, utils) => {
  utils.addProperty(Assertion.prototype, 'performed', function () {
    return this;
  });

  utils.addProperty(Assertion.prototype, 'schedule', function () {
    return this;
  });

  Assertion.addMethod('withJobsCount', async function (expectedCount) {
    const jobName = this._obj;
    const jobs = await knex('pgboss.job').where({ name: jobName });
    assert.strictEqual(
      jobs.length,
      expectedCount,
      `expected ${jobName} to have been performed ${expectedCount} times, but it was performed ${jobs.length} times`,
    );
  });

  Assertion.addMethod('withJob', async function (jobData) {
    await this.withJobsCount(1);

    const jobName = this._obj;
    const jobs = await knex('pgboss.job').select(knex.raw(`*, expirein::varchar`)).where({ name: jobName });
    assert.deepInclude(jobs[0], jobData, `Job '${jobName}' was performed with a different payload`);
  });

  Assertion.addMethod('withCronJobsCount', async function (expectedCount) {
    const jobName = this._obj;
    const jobs = await knex('pgboss.schedule').where({ name: jobName });
    assert.strictEqual(
      jobs.length,
      expectedCount,
      `expected ${jobName} to have been performed ${expectedCount} times, but it was performed ${jobs.length} times`,
    );
  });

  Assertion.addMethod('withCronJob', async function (jobData) {
    await this.withCronJobsCount(1);

    const jobName = this._obj;
    const job = await knex('pgboss.schedule')
      .select('name', 'cron', 'data', 'options')
      .where({ name: jobName })
      .first();
    assert.deepInclude(job, jobData, `Job '${jobName}' was schedule with a different payload`);
  });

  Assertion.addMethod('withJobPayloads', async function (payloads) {
    await this.withJobsCount(payloads.length);

    const jobName = this._obj;
    const jobs = await knex('pgboss.job').where({ name: jobName });
    const actualPayloads = jobs.map((job) => job.data);
    assert.deepEqual(actualPayloads, payloads, `Job '${jobName}' was performed with a different payload`);
  });

  Assertion.addMethod('withJobPayload', async function (payload) {
    await this.withJobPayloads([payload]);
  });
};
