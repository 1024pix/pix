import { usecases } from '../domain/usecases/index.js';

const createRelease = async function (request, h) {
  const { userId } = request.auth.credentials;
  await usecases.scheduleCreateLearningContentReleaseJob({ userId });
  return h.response({}).code(202);
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
  await usecases.patchLearningContentCacheEntry({ recordId, updatedRecord, modelName });
  return h.response().code(204);
};

export const learningContentController = { createRelease, refreshCache, patchCacheEntry };
