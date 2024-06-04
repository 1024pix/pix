import 'dotenv/config';

import { learningContentCache } from '../lib/infrastructure/caches/learning-content-cache.js';
import { logErrorWithCorrelationIds } from '../lib/infrastructure/monitoring-tools.js';
import * as learningContentDatasource from '../src/shared/infrastructure/datasources/learning-content/datasource.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';

logger.info('Starting refreshing Learning Content');
learningContentDatasource
  .refreshLearningContentCacheRecords()
  .then(() => {
    logger.info('Learning Content refreshed');
  })
  .catch((e) => logErrorWithCorrelationIds('Error while reloading cache', e))
  .finally(() => learningContentCache.quit());
