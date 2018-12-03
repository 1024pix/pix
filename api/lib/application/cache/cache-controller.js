const cache = require('../../infrastructure/caches/cache');
const preloader = require('../../infrastructure/caches/preloader');
const logger = require('../../infrastructure/logger');
const usecases = require('../../domain/usecases');
const errorSerializer = require('../../infrastructure/serializers/jsonapi/error-serializer');
const { InfrastructureError } = require('../../infrastructure/errors');

function _buildJsonApiInternalServerError(error) {
  const internalError = new InfrastructureError(error.message);
  return errorSerializer.serialize(internalError);
}

module.exports = {

  reloadCacheEntry(request, h) {
    const cacheKey = request.params.cachekey || '';
    const [ tableName, recordId ] = cacheKey.split('_');
    return usecases.reloadCacheEntry({ preloader, tableName, recordId })
      .then(() => h.response().code(204))
      .catch((error) => h.response(_buildJsonApiInternalServerError(error)).code(500));
  },

  removeAllCacheEntries(request, h) {
    return usecases.removeAllCacheEntries({ cache })
      .then(() => h.response().code(204))
      .catch((error) => h.response(_buildJsonApiInternalServerError(error)).code(500));
  },

  preloadCacheEntries(request, h) {
    return usecases.preloadCacheEntries({ preloader, logger })
      .then(() => h.response().code(204))
      .catch((error) => h.response(_buildJsonApiInternalServerError(error)).code(500));
  }
};
