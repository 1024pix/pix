const AirtableDatasources = require('../../infrastructure/datasources/airtable');
const _ = require('lodash');

module.exports = {

  refreshCacheEntries(request, h) {
    _.forEach(AirtableDatasources, (datasource) => datasource.refreshAirtableCacheRecords());
    return h.response().code(204);
  },

  refreshCacheEntry(request) {
    const cacheKey = request.params.cachekey || '';
    const [tableName, recordId] = cacheKey.split('_');
    const datasource = AirtableDatasources[_.findKey(AirtableDatasources, { tableName })];
    return datasource.refreshAirtableCacheRecord(recordId)
      .then(() => null);
  },

};
