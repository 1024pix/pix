const AirtableDatasources = require('../../infrastructure/datasources/airtable');
const logger = require('../../infrastructure/logger');
const _ = require('lodash');

module.exports = {

  refreshCacheEntries(request, h) {
    _.forEach(AirtableDatasources, (datasource) =>
      datasource.refreshAirtableCacheRecords().catch((e) =>
        logger.error(`Error while reloading cache for ${datasource}`, e)
      )
    );
    return h.response({}).code(202);
  },

  refreshCacheEntry(request) {
    const cacheKey = request.params.cachekey || '';
    const [tableName, recordId] = cacheKey.split('_');
    const datasource = AirtableDatasources[_.findKey(AirtableDatasources, { tableName })];
    return datasource.refreshAirtableCacheRecord(recordId)
      .then(() => null);
  },

};
