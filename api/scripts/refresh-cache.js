import dotenv from 'dotenv';

dotenv.config();
import { learningContentCache } from '../lib/infrastructure/caches/learning-content-cache.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';
import * as learningContentDatasource from '../src/shared/infrastructure/datasources/learning-content/datasource.js';

logger.info('Starting refreshing Learning Content');
learningContentDatasource
  .refreshLearningContentCacheRecords()
  .then(() => {
    logger.info('Learning Content refreshed');
  })
  .catch((e) => logger.error('Error while reloading cache', e))
  .finally(() => learningContentCache.quit());
