const cache = require('../../infrastructure/caches/cache');
const preloader = require('../../infrastructure/caches/preloader');
const logger = require('../../infrastructure/logger');
const usecases = require('../../domain/usecases');
const errorManager = require('../../infrastructure/utils/error-manager');

module.exports = {

  reloadCacheEntry(request, h) {
    const cacheKey = request.params.cachekey || '';
    const [ tableName, recordId ] = cacheKey.split('_');
    return usecases.reloadCacheEntry({ preloader, tableName, recordId })
      .then(() => null)
      .catch((error) => errorManager.send(h, error));
  },

  removeAllCacheEntries(request, h) {
    return usecases.removeAllCacheEntries({ cache })
      .then(() => null)
      .catch((error) => errorManager.send(h, error));
  },

  preloadCacheEntries(request, h) {
    return usecases.preloadCacheEntries({ preloader, logger })
      .then(() => null)
      .catch((error) => errorManager.send(h, error));
  }
};
