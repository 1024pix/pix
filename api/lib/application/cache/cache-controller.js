const AirtableDatasources = require('../../infrastructure/datasources/learning-content');
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
    const cacheKey = request.params.cachekey || '';
    const [tableName, recordId] = cacheKey.split('_');
    const datasource = AirtableDatasources[_.findKey(AirtableDatasources, { tableName })];
    return datasource.refreshLearningContentCacheRecord(recordId)
      .then(() => null);
  },

};
