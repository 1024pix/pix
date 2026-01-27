import PgBoss from 'pg-boss';

import { Metrics } from '../../../../../src/monitoring/infrastructure/metrics.js';
import { JobQueue } from '../../../../../src/shared/infrastructure/jobs/JobQueue.js';
import { JobRepository } from '../../../../../src/shared/infrastructure/repositories/jobs/job-repository.js';
import { pgBoss } from '../../../../../src/shared/infrastructure/repositories/jobs/pg-boss.js';
import { expect } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Jobs | JobQueue', function () {
  let jobQueue;

  beforeEach(async function () {
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
      return createQueue(expectedParams, jobQueue, name);
    });
  });

  describe('cronJob', function () {
    it('save schedule job', async function async() {
      // given
      const name = 'CronJobTest';

      await createQueue(null, jobQueue, name);

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

function createQueue(expectedParams, jobQueue, name) {
  return async () => {
    const handler = class {
      get teamConcurrency() {
        return 1;
      }

      get teamSize() {
        return 2;
      }

      async handle(params) {
        expect(params).to.deep.contains({ data: expectedParams });
      }
    };

    await jobQueue.register(new Metrics({ config: { metrics: { isDirectMetricsEnabled: false } } }), name, handler);
  };
}
