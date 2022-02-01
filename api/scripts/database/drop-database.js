require('dotenv').config();
const logger = require('../../lib/infrastructure/logger');
const PgClient = require('../PgClient');
const { PGSQL_NON_EXISTENT_DATABASE_ERROR } = require('../../db/pgsql-errors');

function isPlatformScalingo() {
  return Boolean(process.env.CONTAINER);
}

function preventDatabaseDropAsItCannotBeCreatedAgain() {
  if (isPlatformScalingo()) {
    logger.error('Database will not be dropped, as it would require to recreate the addon');
    process.exit(1);
  }
}

preventDatabaseDropAsItCannotBeCreatedAgain();

const dbUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

const url = new URL(dbUrl);

const DB_TO_DELETE_NAME = url.pathname.slice(1);

url.pathname = '/postgres';

PgClient.getClient(url.href).then(async (client) => {
  try {
    await client.query_and_log(`DROP DATABASE ${DB_TO_DELETE_NAME};`);
    logger.info('Database dropped');
    await client.end();
    process.exit(0);
  } catch (error) {
    if (error.code === PGSQL_NON_EXISTENT_DATABASE_ERROR) {
      logger.info(`Database ${DB_TO_DELETE_NAME} does not exist`);
      await client.end();
      process.exit(0);
    }
  }
});
