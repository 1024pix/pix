import 'dotenv/config';

import PgBoss from 'pg-boss';

import { disconnect } from '../../db/knex-database-connection.js';
import { logErrorWithCorrelationIds } from '../../lib/infrastructure/monitoring-tools.js';

async function main() {
  console.log('run pgboss migrations');
  const databaseUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  const boss = new PgBoss(databaseUrl);
  await boss.start();
  await boss.stop({ destroy: true });
}

(async () => {
  try {
    await main();
  } catch (error) {
    logErrorWithCorrelationIds(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
})();
