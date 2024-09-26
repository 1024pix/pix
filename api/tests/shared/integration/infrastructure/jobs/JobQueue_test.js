import PgBoss from 'pg-boss';

import { JobQueue } from '../../../../../src/shared/infrastructure/jobs/JobQueue.js';
import { JobRepository } from '../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Jobs | JobQueue', function () {
  let pgBoss, jobQueue;

  beforeEach(async function () {
    pgBoss = new PgBoss(process.env.TEST_DATABASE_URL);
    await pgBoss.start();

    jobQueue = new JobQueue(pgBoss);
  });

  describe('register', function () {
    it('executes job when a job is added to the queue', async function () {
      // given
      const name = 'JobTest';
      const expectedParams = { jobParam: 1 };
      const job = new JobRepository({ name });

      // when
      await job.performAsync(expectedParams);

      // then
      const promise = new Promise((resolve, reject) => {
        const handler = class {
          get teamConcurrency() {
            return 1;
          }

          get teamSize() {
            return 2;
          }

          handle(params) {
            try {
              expect(params).to.deep.contains({ data: expectedParams });
            } catch (err) {
              reject(err);
            }
            resolve();
          }
        };

        jobQueue.register(name, handler);
      });

      return promise;
    });
  });

  describe('cronJob', function () {
    it('save schedule job', async function () {
      // given
      const name = 'CronJobTest';

      // when
      await jobQueue.scheduleCronJob({
        name,
        cron: '*/5 * * * *',
        data: { my_data: 'awesome_data' },
        options: { tz: 'Europe/Paris' },
      });

      await expect(name).to.have.been.schedule.withCronJob({
        name,
        cron: '*/5 * * * *',
        data: { my_data: 'awesome_data' },
        options: { tz: 'Europe/Paris' },
      });
    });

    it('remove schedule job', async function () {
      // given
      const name = 'CronJobTest';
      await jobQueue.scheduleCronJob({
        name,
        cron: '*/5 * * * *',
        data: { my_data: 'awesome_data' },
        options: { tz: 'Europe/Paris' },
      });

      // when
      await jobQueue.unscheduleCronJob(name);

      await expect(name).to.have.been.schedule.withCronJobsCount(0);
    });
  });
});
