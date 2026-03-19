import { PgBoss } from 'pg-boss';

import { databaseConnections } from '../../db/database-connections.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

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
    logger.error(error);
    process.exitCode = 1;
  } finally {
    await databaseConnections.disconnect();
  }
})();
