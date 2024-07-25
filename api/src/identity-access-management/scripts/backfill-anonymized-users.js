import * as url from 'node:url';

import { disconnect } from '../../../db/knex-database-connection.js';
import { usecases } from '../../../lib/domain/usecases/index.js';
import { withTransaction } from '../../shared/domain/DomainTransaction.js';
import { learningContentCache } from '../../shared/infrastructure/caches/learning-content-cache.js';
import { temporaryStorage } from '../../shared/infrastructure/temporary-storage/index.js';
import { logger } from '../../shared/infrastructure/utils/logger.js';
import { anonymizedUserRepository } from '../infrastructure/repositories/anonymized-user.repository.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

if (isLaunchedFromCommandLine) {
  try {
    await backfillAnonymizedUsers();
  } catch (error) {
    logger.error('\x1b[31mErreur : %s\x1b[0m', error.message);
    process.exitCode = 1;
  } finally {
    await disconnect();
    await learningContentCache.quit();
    await temporaryStorage.quit();
  }
}

export async function backfillAnonymizedUsers() {
  const anonymizedUserIds = await anonymizedUserRepository.findIds();

  logger.info(`Total anonymized users to backfill: ${anonymizedUserIds.length}`);

  let current = 1;
  for (const anonymizedUserId of anonymizedUserIds) {
    logger.info(`Backfill anonymized user ${current++}/${anonymizedUserIds.length}: "${anonymizedUserId}"`);
    await withTransaction(usecases.anonymizeUser)({ userId: anonymizedUserId });
  }

  logger.info(`Anonymized users backfill finished.`);
}
