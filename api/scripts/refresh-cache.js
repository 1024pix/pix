'use strict';
import dotenv from 'dotenv';
dotenv.config();
import { logger } from '../lib/infrastructure/logger.js';
import { learningContentCache } from '../lib/infrastructure/caches/learning-content-cache.js';

import * as learningContentDatasource from '../lib/infrastructure/datasources/learning-content/datasource.js';

logger.info('Starting refreshing Learning Content');
learningContentDatasource
  .refreshLearningContentCacheRecords()
  .then(() => {
    logger.info('Learning Content refreshed');
  })
  .catch((e) => logger.error('Error while reloading cache', e))
  .finally(() => learningContentCache.quit());
