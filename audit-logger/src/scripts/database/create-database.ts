import * as dotenv from 'dotenv';

import { PGSQL_DUPLICATE_DATABASE_ERROR } from '../../lib/domain/errors.js';
import { logger } from '../../lib/infrastructure/logger.js';
import PgClient from '../../lib/infrastructure/pg-client.js';

dotenv.config();

async function main(): Promise<void> {
  const dbUrl = (process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL) as string;
  const url = new URL(dbUrl);
  const dbNameToCreate = url.pathname.slice(1);
  let client: PgClient;

  url.pathname = '/postgres';

  try {
    client = await PgClient.createClient(url.href);
    await client.queryAndLog(`CREATE DATABASE ${dbNameToCreate};`);
    logger.info('Database created');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === PGSQL_DUPLICATE_DATABASE_ERROR) {
      logger.info(`Database ${dbNameToCreate} already created`);
    } else {
      logger.error(error);
    }

    process.exitCode = 1;
  } finally {
    // @ts-expect-error: an error can occur after the client is instantiated by calling the query_and_log method
    await client.end();
  }
}

await main();
