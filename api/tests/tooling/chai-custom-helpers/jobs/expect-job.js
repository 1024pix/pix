import { assert, Assertion } from 'chai';
import sinon from 'sinon';

import { JobClient } from '../../../../src/shared/infrastructure/jobs/JobClient.js';

export const jobChai = (_chai, utils) => {
  utils.addProperty(Assertion.prototype, 'performed', function () {
    return this;
  });

  utils.addProperty(Assertion.prototype, 'schedule', function () {
    return this;
  });

  utils.addProperty(Assertion.prototype, 'publishedEvent', function () {
    return this;
  });

  Assertion.addMethod('withJobsCount', async function (expectedCount) {
    const jobName = this._obj;
    const rawJobs = await JobClient.instance.fetch(jobName, { includeMetadata: true, batchSize: expectedCount + 1 });
    const jobs = rawJobs.toSorted((a, b) => {
      if (a.createdOn > b.createdOn) return 1;
      return -1;
    });

    const actualCount = jobs?.length ?? 0;
    assert.strictEqual(
      actualCount,
      expectedCount,
      `expected ${jobName} to have been performed ${expectedCount} times, but it was performed ${actualCount} times`,
    );
    return (jobs ?? []).map(({ id, name, data, retryLimit, retryDelay, retryBackoff, expireInSeconds, priority }) => ({
      id,
      name,
      data,
      retryLimit,
      retryDelay,
      retryBackoff,
      expireIn: Math.round(expireInSeconds),
      priority,
    }));
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
    const allJobs = (await JobClient.instance.getSchedules()) ?? [];
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

  Assertion.addMethod('withJobPayloads', _checkPayloads);

  Assertion.addMethod('withEventPayloads', _checkPayloads);

  Assertion.addMethod('withJobPayload', async function (payload) {
    await this.withJobPayloads([payload]);
  });

  Assertion.addMethod('withEventPayload', async function (payload) {
    await this.withEventPayloads([payload]);
  });
};

async function _checkPayloads(payloads) {
  const jobs = await this.withJobsCount(payloads.length);

  const jobName = this._obj;
  const actualPayloads = jobs.map((job) => job.data);

  try {
    sinon.assert.match(actualPayloads, payloads);
  } catch {
    this.assert(false, `Job '${jobName}' was performed with a different payload`, undefined, payloads, actualPayloads);
  }
}
