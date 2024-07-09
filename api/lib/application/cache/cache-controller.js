import _ from 'lodash';

import { sharedUsecases as usecases } from '../../../src/shared/domain/usecases/index.js';
import * as LearningContentDatasources from '../../../src/shared/infrastructure/datasources/learning-content/index.js';

const refreshCacheEntries = async function (_, h) {
  await usecases.refreshLearningContentCache();
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
