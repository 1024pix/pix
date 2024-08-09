import { knex } from '../db/knex-database-connection.js';
import { JobPgBoss } from '../src/shared/infrastructure/jobs/JobPgBoss.js';

const JOBS_COUNT = 50000;

for (let i = 0; i < JOBS_COUNT; i++) {
  const job = new JobPgBoss(
    {
      name: 'answer',
    },
    knex,
  );

  await job.schedule({
    userId: 107371,
  });
}
