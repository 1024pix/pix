const dotenv = require('dotenv');
dotenv.config();
const PgBoss = require('pg-boss');
const logger = require('../../lib/infrastructure/logger');
const { disconnect } = require('../../db/knex-database-connection');

async function main() {
  console.log('run pgboss migrations');
  const databaseUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  const boss = new PgBoss(databaseUrl);
  await boss.start();
  await boss.stop();
}

(async () => {
  try {
    await main();
  } catch (error) {
    logger.error(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
})();
