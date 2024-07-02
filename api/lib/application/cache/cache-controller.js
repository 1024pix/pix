import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import * as LearningContentDatasources from '../../../src/shared/infrastructure/datasources/learning-content/index.js';
import { LcmsRefreshCacheJob } from '../../infrastructure/jobs/lcms/LcmsRefreshCacheJob.js';

const refreshCacheEntries = async function (_, h) {
  const refreshJob = new LcmsRefreshCacheJob(knex);
  await refreshJob.schedule();
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
