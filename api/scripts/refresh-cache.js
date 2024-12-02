import 'dotenv/config';

import { disconnect } from '../db/knex-database-connection.js';
import { usecases } from '../src/learning-content/domain/usecases/index.js';
import { learningContentCache } from '../src/shared/infrastructure/caches/learning-content-cache.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';

logger.info('Starting refreshing Learning Content');

try {
  await usecases.refreshLearningContentCache();
  logger.info('Learning Content refreshed');
} catch (e) {
  logger.error(e, 'Error while reloading cache');
} finally {
  await learningContentCache.quit();
  await disconnect();
}
