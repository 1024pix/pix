import * as url from 'node:url';

import { disconnect } from '../../../db/knex-database-connection.js';
import { logger } from '../../shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

if (isLaunchedFromCommandLine) {
  try {
    await backfillAnonymizedUsers();
  } catch (error) {
    logger.error('\x1b[31mErreur : %s\x1b[0m', error.message);
    process.exitCode = 1;
  } finally {
    disconnect();
  }
}

export async function backfillAnonymizedUsers() {
  //
}
