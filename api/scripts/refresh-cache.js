import dotenv from 'dotenv';
dotenv.config();
import logger from '../lib/infrastructure/logger';
import cache from '../lib/infrastructure/caches/learning-content-cache';
import learningContentDatasource from '../lib/infrastructure/datasources/learning-content/datasource';

logger.info('Starting refreshing Learning Content');
learningContentDatasource
  .refreshLearningContentCacheRecords()
  .then(() => {
    logger.info('Learning Content refreshed');
  })
  .catch((e) => logger.error('Error while reloading cache', e))
  .finally(() => cache.quit());
