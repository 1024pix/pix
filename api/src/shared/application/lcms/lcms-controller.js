import _ from 'lodash';

import { sharedUsecases as usecases } from '../../domain/usecases/index.js';
import * as LearningContentDatasources from '../../infrastructure/datasources/learning-content/index.js';
import { logger } from '../../infrastructure/utils/logger.js';

const createRelease = async function (request, h) {
  usecases
    .createLcmsRelease()
    .then(() => {
      logger.info('Release created and cache reloaded');
    })
    .catch((e) => {
      logger.error('Error while creating the release and reloading cache', e);
    });
  return h.response({}).code(204);
};

const refreshCacheEntries = async function (request, h) {
  const { userId } = request.auth.credentials;

  await usecases.refreshLearningContentCache({ userId });
  return h.response({}).code(202);
};

const refreshCacheEntry = async function (request, h) {
  const updatedRecord = request.payload;
  const recordId = request.params.id;
  const datasource =
    LearningContentDatasources[_.findKey(LearningContentDatasources, { modelName: request.params.model })];
  await datasource.refreshLearningContentCacheRecord(recordId, updatedRecord);
  return h.response().code(204);
};

const lcmsController = { createRelease, refreshCacheEntries, refreshCacheEntry };

export { lcmsController };
