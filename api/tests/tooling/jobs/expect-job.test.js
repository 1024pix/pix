import { JobPgBoss } from '../../../src/shared/infrastructure/jobs/JobPgBoss.js';
import { catchErr, expect, knex } from '../../test-helper.js';

describe('Integration | Tooling | Expect Job', function () {
  describe('#withJobsCount', function () {
    it('succeeds when count of executed jobs is correct', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);
      const job2 = new JobPgBoss({ name: 'JobTest2' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });
      await job2.performAsync({ foo: 'bar' });
      await job2.performAsync({ foo: 'bar' });

      // then
      await expect('JobTest').to.have.been.performed.withJobsCount(1);
      await expect('JobTest2').to.have.been.performed.withJobsCount(2);
      await expect('JobTestOther').to.have.been.performed.withJobsCount(0);
    });

    it('fails when count of executed jobs is not correct', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });

      const expectation = () => expect('JobTest').to.have.been.performed.withJobsCount(2);
      const error = await catchErr(expectation)();

      // then
      expect(error.message).to.equal(
        'expected JobTest to have been performed 2 times, but it was performed 1 times: expected 1 to equal 2',
      );
    });
  });

  describe('#withJob', function () {
    it('succeeds when the full job data is the same', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });

      // then
      await expect('JobTest').to.have.been.performed.withJob({
        name: 'JobTest',
        data: { foo: 'bar' },
        retrylimit: job.retryLimit,
        retrydelay: job.retryDelay,
        retrybackoff: job.retryBackoff,
        expirein: job.expireIn,
      });
    });

    it('fails when the full job data is not the same', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });

      const expectation = () => expect('JobTest').to.have.been.performed.withJob({ name: 'foo' });
      const error = await catchErr(expectation)();

      // then
      expect(error.message).to.contains(`Job 'JobTest' was performed with a different payload`);
    });

    it('fails when multiple jobs are triggered instead of 1', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });
      await job.performAsync({ foo: 'bar' });

      const expectation = () => expect('JobTest').to.have.been.performed.withJob({ name: 'foo' });
      const error = await catchErr(expectation)();

      // then
      expect(error.message).to.equal(
        'expected JobTest to have been performed 1 times, but it was performed 2 times: expected 2 to equal 1',
      );
    });
  });

  describe('#withJobPayloads', function () {
    it('succeeds when the jobs payloads are correct', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });
      await job.performAsync({ bar: 'baz' });

      // then
      await expect('JobTest').to.have.been.performed.withJobPayloads([{ foo: 'bar' }, { bar: 'baz' }]);
    });

    it('fails when not all job payloads are correct', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });
      await job.performAsync({ bar: 'biz' });

      const expectation = () =>
        expect('JobTest').to.have.been.performed.withJobPayloads([{ foo: 'bar' }, { bar: 'baz' }]);
      const error = await catchErr(expectation)();

      // then
      expect(error.message).to.contains(`Job 'JobTest' was performed with a different payload`);
    });

    it('fails when not all jobs are executed', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });

      const expectation = () =>
        expect('JobTest').to.have.been.performed.withJobPayloads([{ foo: 'bar' }, { bar: 'baz' }]);
      const error = await catchErr(expectation)();

      // then
      expect(error.message).to.equal(
        'expected JobTest to have been performed 2 times, but it was performed 1 times: expected 1 to equal 2',
      );
    });
  });

  describe('#withJobPayload', function () {
    it('succeeds when the job payload is correct', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);
      const job2 = new JobPgBoss({ name: 'JobTest2' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });
      await job2.performAsync({ bar: 'baz' });

      // then
      await expect('JobTest').to.have.been.performed.withJobPayload({ foo: 'bar' });
      await expect('JobTest2').to.have.been.performed.withJobPayload({ bar: 'baz' });
    });

    it('fails when the job payload is not correct', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });

      const expectation = () => expect('JobTest').to.have.been.performed.withJobPayload({ boo: 'boo' });
      const error = await catchErr(expectation)();

      // then
      expect(error.message).to.contains(`Job 'JobTest' was performed with a different payload`);
    });

    it('fails when multiple jobs are triggered instead of 1', async function () {
      // given
      const job = new JobPgBoss({ name: 'JobTest' }, knex);

      // when
      await job.performAsync({ foo: 'bar' });
      await job.performAsync({ foo: 'bar' });

      const expectation = () => expect('JobTest').to.have.been.performed.withJobPayload({ foo: 'bar' });
      const error = await catchErr(expectation)();

      // then
      expect(error.message).to.equal(
        'expected JobTest to have been performed 1 times, but it was performed 2 times: expected 2 to equal 1',
      );
    });
  });
});
