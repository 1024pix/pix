import PgBoss from 'pg-boss';

import { Metrics } from '../../../../../src/monitoring/infrastructure/metrics.js';
import { getContext } from '../../../../../src/shared/infrastructure/async-local-storage.js';
import { JobQueue } from '../../../../../src/shared/infrastructure/jobs/JobQueue.js';
import { JobRepository } from '../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { expect, sinon } from '../../../../test-helper.js';

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

        jobQueue.register(new Metrics({ config: { metrics: { isDirectMetricsEnabled: false } } }), name, handler);
      });

      return promise;
    });

    it('runs the job within an execution context', async function () {
      // given
      const name = 'JobTest';
      const job = new JobRepository({ name });

      // when
      await job.performAsync({ jobParam: 1 });

      // then
      const promise = new Promise((resolve, reject) => {
        const handler = class {
          get teamConcurrency() {
            return 1;
          }

          get teamSize() {
            return 2;
          }

          handle(_) {
            try {
              const currentContext = getContext();
              sinon.assert.match(currentContext, {
                jobId: sinon.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
              });
            } catch (err) {
              reject(err);
            }
            resolve();
          }
        };

        jobQueue.register(new Metrics({ config: { metrics: { isDirectMetricsEnabled: false } } }), name, handler);
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
