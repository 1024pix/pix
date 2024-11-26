import { sharedUsecases } from '../../shared/domain/usecases/index.js';
import { logger } from '../../shared/infrastructure/utils/logger.js';
import { usecases } from '../domain/usecases/index.js';

const createRelease = async function (request, h) {
  sharedUsecases
    .createLcmsRelease()
    .then(() => {
      logger.info('Release created and cache reloaded');
    })
    .catch((e) => {
      logger.error('Error while creating the release and reloading cache', e);
    });
  return h.response({}).code(204);
};

const refreshCache = async function (request, h) {
  const { userId } = request.auth.credentials;
  await usecases.scheduleRefreshLearningContentCacheJob({ userId });
  return h.response({}).code(202);
};

const patchCacheEntry = async function (request, h) {
  const updatedRecord = request.payload;
  const recordId = request.params.id;
  const modelName = request.params.model;
  await sharedUsecases.patchLearningContentCacheEntry({ recordId, updatedRecord, modelName });
  return h.response().code(204);
};

export const learningContentController = { createRelease, refreshCache, patchCacheEntry };
