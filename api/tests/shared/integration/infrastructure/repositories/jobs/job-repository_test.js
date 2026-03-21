import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { executeInContext } from '../../../../../../src/shared/infrastructure/async-local-storage.js';
import {
  JobExpireIn,
  JobPriority,
  JobRepository,
  JobRetry,
} from '../../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { catchErr, catchErrSync, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Repositories | Jobs | job-repository', function () {
  it('create one job db with given config', async function () {
    // given
    const name = 'JobTest';
    const expectedCorrelationContext = { user_id: null };
    const expectedParams = { jobParam: 1, correlationContext: expectedCorrelationContext };
    const retry = JobRetry.STANDARD_RETRY;
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retry, priority });

    // when
    await job.performAsync(expectedParams);

    await expect(name).to.have.been.performed.withJob({
      name,
      data: expectedParams,
      expirein: '48:00:00',
      priority,
      retrydelay: 30,
      retrylimit: 10,
      retrybackoff: true,
    });
  });

  it('create jobs db with given config', async function () {
    // given
    const name = 'JobTest';
    const expectedCorrelationContext = { user_id: null };
    const expectedParams = [
      { jobParam: 1, correlationContext: expectedCorrelationContext },
      { jobParam: 2, correlationContext: expectedCorrelationContext },
    ];
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, priority });

    // when
    await job.performAsync(...expectedParams);

    // then
    await expect(name).to.have.been.performed.withJobPayloads(expectedParams);
  });

  it('creates one job and attach current correlation context', async function () {
    // given
    const context = {
      request: {
        headers: { 'x-request-id': 'someRequestId' },
        auth: { credentials: { userId: 456 } },
      },
      scriptName: 'someScriptName',
      irrelevantDataForCorrelation: 'coucou',
    };
    const name = 'JobTest';
    const expectedCorrelationContext = {
      user_id: 456,
      request_id: 'someRequestId',
      scriptName: 'someScriptName',
      jobId: null,
    };
    const expectedParams = { jobParam: 1, correlationContext: expectedCorrelationContext };
    const retry = JobRetry.STANDARD_RETRY;
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retry, priority });

    // when
    await executeInContext(context, async () => {
      return await job.performAsync(expectedParams);
    });

    await expect(name).to.have.been.performed.withJob({
      name,
      data: expectedParams,
      expirein: '48:00:00',
      priority,
      retrydelay: 30,
      retrylimit: 10,
      retrybackoff: true,
    });
  });

  it('return inserted count jobs', async function () {
    // given
    const name = 'JobTest';
    const expectedParams = [{ jobParam: 1 }, { jobParam: 2 }];
    const retry = JobRetry.STANDARD_RETRY;
    const expireIn = JobExpireIn.INFINITE;
    const priority = JobPriority.HIGH;

    const job = new JobRepository({ name, retry, expireIn, priority });

    // when
    const jobsInserted = await job.performAsync(...expectedParams);

    // then
    expect(jobsInserted.rowCount).to.equal(2);
  });

  context('transaction', function () {
    context('when no transaction ongoing', function () {
      // todo GUL ca me plait pas trop la manière dont c'est fait
      // avant ça pétait au moment de faire l'insert car le job n'a pas une data valide en jsonb
      // maintenant je pète avant, au moment d'ajouter mon contexte de corrélation aux params de base du job
      // ne faudrait-il pas de toute façon valider les params du performAsync() avant de soumettre à PG ??
      it("should not insert any jobs if one of them is invalid and can't be inserted", async function () {
        // given
        const name = 'JobTest';
        // Knex doc : default chunk for batchInsert is 1000
        const defaultChunkValidJobs = [...Array(1000).keys()].map((i) => ({ jobParam: i }));
        const invalidJob = '>';
        const priority = JobPriority.HIGH;
        const job = new JobRepository({ name, priority });

        // when
        await catchErr(job.performAsync, job)(...defaultChunkValidJobs, invalidJob);

        // then
        //expect(expectedError.detail).to.equal('Token ">" is invalid.');
        const { count } = await knex('pgboss.job').count('id').first();
        expect(count).to.equal(0);
      });
    });

    context('when a transaction ongoing in DomainTransaction', function () {
      it('should use the same existing transaction', async function () {
        // given
        const name = 'JobTest';
        const jobs = [{ jobParam: 1 }, { jobParam: 2 }];
        const priority = JobPriority.HIGH;
        const job = new JobRepository({ name, priority });

        // when
        let knexConn;
        const callback = async () => {
          knexConn = DomainTransaction.getConnection();
          await knexConn('features').insert({ key: 'someRandomFeature' });
          await job.performAsync(...jobs);
          const { count: countFeaturesBefore } = await knexConn('features').count('id').first();
          expect(countFeaturesBefore).to.equal(1);
          const { count: countJobsBefore } = await knexConn('pgboss.job').count('id').first();
          expect(countJobsBefore).to.equal(2);
          throw new Error('I want to rollback');
        };
        const expectedError = await catchErr(DomainTransaction.execute)(callback);

        // then
        expect(expectedError.message).to.equal('I want to rollback');
        const { count: countFeaturesAfter } = await knex('features').count('id').first();
        expect(countFeaturesAfter).to.equal(0);
        const { count: countJobsAfter } = await knex('pgboss.job').count('id').first();
        expect(countJobsAfter).to.equal(0);
      });
    });
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
