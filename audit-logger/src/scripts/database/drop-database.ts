import * as dotenv from 'dotenv';

import { PGSQL_NON_EXISTENT_DATABASE_ERROR } from '../../lib/domain/errors.js';
import { logger } from '../../lib/infrastructure/logger.js';
import PgClient from '../../lib/infrastructure/pg-client.js';

dotenv.config();

function preventDatabaseDropOnScalingoPlatform(): void {
  if (_isPlatformScalingo()) {
    logger.error('Database will not be dropped, as it would require to recreate the addon');
    process.exitCode = 1;
  }
}

async function main(): Promise<void> {
  preventDatabaseDropOnScalingoPlatform();

  const dbUrl = (process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL) as string;
  const url = new URL(dbUrl);
  const dbNameToDelete = url.pathname.slice(1);
  let client: PgClient;

  url.pathname = '/postgres';

  try {
    client = await PgClient.createClient(url.href);
    await client.queryAndLog(`DROP DATABASE ${dbNameToDelete}${_withForceOption()};`);
    logger.info('Database dropped');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === PGSQL_NON_EXISTENT_DATABASE_ERROR) {
      logger.info(`Database ${dbNameToDelete} does not exist`);
      process.exitCode = 0;
    } else {
      logger.error(error);
      process.exitCode = 1;
    }
  } finally {
    // @ts-expect-error: an error can occur after the client is instantiated by calling the query_and_log method
    await client.end();
  }
}

await main();

function _isPlatformScalingo(): boolean {
  return Boolean(process.env.CONTAINER);
}

function _withForceOption(): string {
  return process.env.FORCE_DROP_DATABASE === 'true' ? ' WITH (FORCE)' : '';
}
