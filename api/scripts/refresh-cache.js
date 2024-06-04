import 'dotenv/config';

import { learningContentCache } from '../lib/infrastructure/caches/learning-content-cache.js';
import { logErrorWithCorrelationIds, logInfoWithCorrelationIds } from '../lib/infrastructure/monitoring-tools.js';
import * as learningContentDatasource from '../src/shared/infrastructure/datasources/learning-content/datasource.js';

logInfoWithCorrelationIds('Starting refreshing Learning Content');
learningContentDatasource
  .refreshLearningContentCacheRecords()
  .then(() => {
    logInfoWithCorrelationIds('Learning Content refreshed');
  })
  .catch((e) => logErrorWithCorrelationIds('Error while reloading cache', e))
  .finally(() => learningContentCache.quit());
