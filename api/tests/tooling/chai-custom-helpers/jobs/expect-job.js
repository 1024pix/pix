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
    // Returning 0 for equal timestamps matters: jobs inserted by a single batched call share
    // the same `createdOn`, and a comparator that answers -1 in both directions breaks the
    // comparison contract, which makes the sort result unspecified.
    const jobs = rawJobs.toSorted((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());

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

  const actualPayloadsWithoutCorrelactionContext = _withoutCorrelactionContext(actualPayloads);
  const expectedPayloadsWithoutCorrelactionContext = _withoutCorrelactionContext(payloads);

  assert.exists(
    actualPayloadsWithoutCorrelactionContext,
    `Payload actualPayloadWithoutCorreslationContext is undefined`,
  );
  assert.exists(
    expectedPayloadsWithoutCorrelactionContext,
    `Payload expectedPayloadWithoutCorreslationContext is undefined`,
  );
  // Jobs inserted by a single batched call share the same `createdOn` and carry a uuid `id`,
  // so pg-boss guarantees no order between them. Match the payloads as an unordered multiset
  // rather than position by position, while still supporting the sinon matchers
  // (sinon.match.string, sinon.match.number…) that callers embed in the expected payloads.
  const remainingActualPayloads = [...actualPayloadsWithoutCorrelactionContext];
  const unmatchedPayloads = expectedPayloadsWithoutCorrelactionContext.filter((expectedPayload) => {
    const matchIndex = remainingActualPayloads.findIndex((actualPayload) =>
      sinon.match(expectedPayload).test(actualPayload),
    );
    if (matchIndex === -1) return true;

    remainingActualPayloads.splice(matchIndex, 1);
    return false;
  });

  this.assert(
    unmatchedPayloads.length === 0,
    `Job '${jobName}' was performed with a different payload`,
    undefined,
    payloads,
    actualPayloads,
  );
}

function _withoutCorrelactionContext(payloads) {
  const newPayloads = [];
  payloads.forEach((payload) => {
    delete payload.correlationContext;
    newPayloads.push(payload);
  });
  return newPayloads;
}
