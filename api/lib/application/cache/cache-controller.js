const LearningContentDatasources = require('../../infrastructure/datasources/learning-content');
const learningContentDatasource = require('../../infrastructure/datasources/learning-content/datasource');
const logger = require('../../infrastructure/logger');
const _ = require('lodash');

module.exports = {

  refreshCacheEntries(request, h) {
    learningContentDatasource.refreshLearningContentCacheRecords().catch((e) =>
      logger.error('Error while reloading cache', e),
    );
    return h.response({}).code(202);
  },

  refreshCacheEntry(request) {
    const updatedRecord = request.payload;
    const recordId = request.params.id;
    const datasource = LearningContentDatasources[_.findKey(LearningContentDatasources, { modelName: request.params.model })];
    return datasource.refreshLearningContentCacheRecord(recordId, updatedRecord)
      .then(() => null);
  },

};
