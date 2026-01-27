import { databaseConnections } from '../../db/database-connections.js';
import { knex } from '../../db/knex-database-connection.js';
import { pgBoss as boss } from '../../src/shared/infrastructure/repositories/jobs/pg-boss.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

async function main() {
  console.log('run pgboss migrations');
  // const databaseUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  const res = await boss.createQueue('queue');
  await boss.start();
  console.log(res);
  await migrateJobsFromV9ToV10(boss);
  await boss.stop({ destroy: true });
}

async function migrateJobsFromV9ToV10(boss) {
  const targetSchema = 'pgboss_v10';
  const sourceSchema = 'pgboss';
  const queues = await boss.getQueues();

  for (const queue of queues) {
    try {
      const sql = `
              INSERT INTO ${targetSchema}.job (
                  id,
                  name,
                  priority,
                  data,
                  retry_limit,
                  retry_count,
                  retry_delay,
                  retry_backoff,
                  start_after,
                  singleton_key,
                  singleton_on,
                  expire_in,
                  created_on,
                  keep_until,
                  output,
                  policy
              )
              SELECT
                  id,
                  name,
                  priority,
                  data,
                  retryLimit,
                  retryCount,
                  retryDelay,
                  retryBackoff,
                  startAfter,
                  singletonKey,
                  singletonOn,
                  expireIn,
                  createdOn,
                  keepUntil,
                  output jsonb,
                  '${queue.policy}' as policy
              FROM ${sourceSchema}.job
              WHERE name = '${queue.name}'
                  AND state = 'created'
              ON CONFLICT DO NOTHING
          `;

      const { rowCount } = await knex.raw(sql);

      if (rowCount) {
        logger.info(`pg-boss v10 migration: Migrated ${rowCount} jobs in queue ${queue.name}`);
      }
    } catch (error) {
      logger.error(`pg-boss v10 migration: error copying jobs from '${queue.name}': ${error.message}`);
    }
  }
}

try {
  await main();
} catch (error) {
  logger.error(error);
  process.exitCode = 1;
} finally {
  await databaseConnections.disconnect();
}
