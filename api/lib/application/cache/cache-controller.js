const cache = require('../../infrastructure/caches/cache');
const preloader = require('../../infrastructure/caches/preloader');
const logger = require('../../infrastructure/logger');
const usecases = require('../../domain/usecases');

module.exports = {

  reloadCacheEntry(request) {
    const cacheKey = request.params.cachekey || '';
    const [ tableName, recordId ] = cacheKey.split('_');
    return usecases.reloadCacheEntry({ preloader, tableName, recordId })
      .then(() => null);
  },

  removeAllCacheEntries() {
    return usecases.removeAllCacheEntries({ cache })
      .then(() => null);
  },

  preloadCacheEntries() {
    return usecases.preloadCacheEntries({ preloader, logger })
      .then(() => null);
  }
};
