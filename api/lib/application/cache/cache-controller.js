const AirtableDatasources = require('../../infrastructure/datasources/airtable');
const _ = require('lodash');

module.exports = {

  refreshCacheEntries() {
    return Promise.all(_.map(AirtableDatasources, (datasource) => datasource.refreshAirtableCacheRecords()))
      .then(() => null);
  },

  refreshCacheEntry(request) {
    const cacheKey = request.params.cachekey || '';
    const [tableName, recordId] = cacheKey.split('_');
    const datasource = AirtableDatasources[_.findKey(AirtableDatasources, { tableName })];
    return datasource.refreshAirtableCacheRecord(recordId)
      .then(() => null);
  },

};
