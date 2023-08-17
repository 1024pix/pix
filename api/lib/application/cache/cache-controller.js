import _ from 'lodash';

import * as learningContentDatasource from '../../infrastructure/datasources/learning-content/datasource.js';
import * as LearningContentDatasources from '../../infrastructure/datasources/learning-content/index.js';
import { logger } from '../../infrastructure/logger.js';

const refreshCacheEntries = function (_, h, dependencies = { learningContentDatasource }) {
  dependencies.learningContentDatasource
    .refreshLearningContentCacheRecords()
    .catch((e) => logger.error('Error while reloading cache', e));
  return h.response({}).code(202);
};

const refreshCacheEntry = function (request) {
  const updatedRecord = request.payload;
  const recordId = request.params.id;
  const datasource =
    // eslint-disable-next-line import/namespace
    LearningContentDatasources[_.findKey(LearningContentDatasources, { modelName: request.params.model })];
  return datasource.refreshLearningContentCacheRecord(recordId, updatedRecord).then(() => null);
};

const cacheController = { refreshCacheEntries, refreshCacheEntry };

export { cacheController };
