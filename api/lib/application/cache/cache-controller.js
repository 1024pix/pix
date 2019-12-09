const cache = require('../../infrastructure/caches/cache');
const AirtableDatasources = require('../../infrastructure/datasources/airtable');
const _ = require('lodash');

module.exports = {

  reloadCacheEntries() {
    return Promise.all(_.map(AirtableDatasources, (datasource) => datasource.loadEntries()))
      .then(() => null);
  },

  reloadCacheEntry(request) {
    const cacheKey = request.params.cachekey || '';
    const [tableName, recordId] = cacheKey.split('_');
    const datasource = AirtableDatasources[_.findKey(AirtableDatasources, { tableName })];
    return datasource.loadEntry(recordId)
      .then(() => null);
  },

  removeCacheEntries() {
    return cache.flushAll()
      .then(() => null);
  },

};
