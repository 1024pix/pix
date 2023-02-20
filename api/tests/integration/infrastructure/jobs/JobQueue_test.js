import { expect, knex } from '../../../test-helper';
import JobQueue from '../../../../lib/infrastructure/jobs/JobQueue';
import Job from '../../../../lib/infrastructure/jobs/JobPgBoss';
import PgBoss from 'pg-boss';

describe('Integration | Infrastructure | Jobs | JobQueue', function () {
  let dependenciesBuilder;

  beforeEach(function () {
    dependenciesBuilder = { build: (handler) => handler };
  });

  it('executes job when a job is added to the queue', async function () {
    const name = 'JobTest';
    const expectedParams = { jobParam: 1 };
    const job = new Job({ name }, knex);
    await job.schedule(expectedParams);
    const pgBoss = new PgBoss(process.env.TEST_DATABASE_URL);
    await pgBoss.start();

    const jobQueue = new JobQueue(pgBoss, dependenciesBuilder);

    const promise = new Promise((resolve, reject) => {
      const handler = {
        handle: (params) => {
          try {
            expect(params).to.deep.equal(expectedParams);
          } catch (err) {
            reject(err);
          }
          resolve();
        },
      };

      jobQueue.performJob(name, handler);
    });

    return promise;
  });
});
