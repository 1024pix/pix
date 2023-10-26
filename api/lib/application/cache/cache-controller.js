import * as LearningContentDatasources from '../../infrastructure/datasources/learning-content/index.js';
import * as learningContentDatasource from '../../infrastructure/datasources/learning-content/datasource.js';
import { logger } from '../../infrastructure/logger.js';
import _ from 'lodash';

const refreshCacheEntries = function (_, h, dependencies = { learningContentDatasource }) {
  dependencies.learningContentDatasource
    .refreshLearningContentCacheRecords()
    .catch((e) => logger.error('Error while reloading cache', e));
  return h.response({}).code(202);
};

const refreshCacheEntry = async function (request, h) {
  const updatedRecord = request.payload;
  const recordId = request.params.id;
  const datasource =
    // eslint-disable-next-line import/namespace
    LearningContentDatasources[_.findKey(LearningContentDatasources, { modelName: request.params.model })];
  await datasource.refreshLearningContentCacheRecord(recordId, updatedRecord);
  return h.response().code(204);
};

const cacheController = { refreshCacheEntries, refreshCacheEntry };

export { cacheController };
