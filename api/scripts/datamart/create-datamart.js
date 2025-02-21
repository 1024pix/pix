import 'dotenv/config';

import { PGSQL_DUPLICATE_DATABASE_ERROR, PGSQL_DUPLICATE_SCHEMA_ERROR } from '../../db/pgsql-errors.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { PgClient } from '../PgClient.js';

const createDatabase = async (client, dbToCreateName) => {
  try {
    await client.query_and_log(`CREATE DATABASE ${dbToCreateName};`);
    logger.info('Database created');
  } catch (error) {
    if (error.code === PGSQL_DUPLICATE_DATABASE_ERROR) {
      logger.info(`Database ${dbToCreateName} already created`);
    } else {
      logger.error(`Database creation failed: ${error.detail}`);
    }
  } finally {
    await client.end();
  }
};

const createSchema = async (client, dbSchema) => {
  try {
    if (dbSchema) {
      try {
        await client.query_and_log(`CREATE SCHEMA ${dbSchema};`);
        logger.info('Schema created: ' + dbSchema);
      } catch (error) {
        if (error.code === PGSQL_DUPLICATE_SCHEMA_ERROR) {
          logger.info(`Schema ${dbSchema} already created`);
        } else {
          logger.error(`Schema creation failed: ${error.detail}`);
        }
      }
    }
  } finally {
    await client.end();
  }
};

const dbUrl =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATAMART_DATABASE_URL : process.env.DATAMART_DATABASE_URL;
const url = new URL(dbUrl);
const DB_TO_CREATE_NAME = url.pathname.slice(1);
url.pathname = '/postgres';
const clientForCreateDatabase = await PgClient.getClient(url.href);
await createDatabase(clientForCreateDatabase, DB_TO_CREATE_NAME);

const dbSchema =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATAMART_DATABASE_SCHEMA : process.env.DATAMART_DATABASE_SCHEMA;
url.pathname = '/' + DB_TO_CREATE_NAME;
const clientForCreateSchema = await PgClient.getClient(url.href);
await createSchema(clientForCreateSchema, dbSchema);
