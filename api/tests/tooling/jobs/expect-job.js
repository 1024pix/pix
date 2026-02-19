import { assert, Assertion } from 'chai';

export const jobChai = (pgBoss) => (_chai, utils) => {
  utils.addProperty(Assertion.prototype, 'performed', function () {
    return this;
  });

  utils.addProperty(Assertion.prototype, 'schedule', function () {
    return this;
  });

  Assertion.addMethod('withJobsCount', async function (expectedCount) {
    const jobName = this._obj;
    const jobs = await pgBoss.fetch(jobName, expectedCount + 1, { includeMetadata: true });
    const actualCount = jobs?.length ?? 0;

    assert.strictEqual(
      actualCount,
      expectedCount,
      `expected ${jobName} to have been performed ${expectedCount} times, but it was performed ${actualCount} times`,
    );
    return (jobs ?? []).map(
      ({ id, name, data, retrylimit, retrydelay, retrybackoff, expire_in_seconds, priority }) => ({
        id,
        name,
        data,
        retryLimit: retrylimit,
        retryDelay: retrydelay,
        retryBackoff: retrybackoff,
        expireIn: Math.round(expire_in_seconds),
        priority,
      }),
    );
  });

  Assertion.addMethod('withJob', async function (jobData) {
    const jobs = await this.withJobsCount(1);

    const jobName = this._obj;
    assert.deepOwnInclude(
      jobs[0],
      jobData,
      `Job '${jobName}' was performed with a different payload (${JSON.stringify(jobData)} was expected but performed with ${JSON.stringify(jobs[0])})`,
    );
  });

  Assertion.addMethod('withCronJobsCount', async function (expectedCount) {
    const jobName = this._obj;
    const allJobs = (await pgBoss.getSchedules()) ?? [];
    const jobs = allJobs.filter(({ name }) => name === jobName);
    assert.strictEqual(
      jobs.length,
      expectedCount,
      `expected ${jobName} to have been performed ${expectedCount} times, but it was performed ${jobs.length} times`,
    );
    return jobs;
  });

  Assertion.addMethod('withCronJob', async function (jobData) {
    const jobs = await this.withCronJobsCount(1);

    const jobName = this._obj;
    assert.deepOwnInclude(
      jobs[0],
      jobData,
      `Job '${jobName}' was schedule with a different payload (${JSON.stringify(jobData)} was expected but performed with ${JSON.stringify(jobs[0])})`,
    );
  });

  Assertion.addMethod('withJobPayloads', async function (payloads) {
    const jobs = await this.withJobsCount(payloads.length);

    const jobName = this._obj;
    const actualPayloads = jobs.map((job) => job.data);
    assert.sameDeepMembers(actualPayloads, payloads, `Job '${jobName}' was performed with a different payload`);
  });

  Assertion.addMethod('withJobPayload', async function (payload) {
    await this.withJobPayloads([payload]);
  });
};
