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

  removeCacheEntry(request, reply) {
    const cacheKey = request.params.cachekey;
    return usecases.removeCacheEntry({ cacheKey, cache })
      .then(() => reply().code(204))
      .catch((error) => reply(_buildJsonApiInternalServerError(error)).code(500));
  },

  removeAllCacheEntries(request, reply) {
    return usecases.removeAllCacheEntries({ cache })
      .then(() => reply().code(204))
      .catch((error) => reply(_buildJsonApiInternalServerError(error)).code(500));
  },

  preloadCacheEntries(request, reply) {
    return usecases.preloadCacheEntries({ preloader, logger })
      .then(() => reply().code(204))
      .catch((error) => reply(_buildJsonApiInternalServerError(error)).code(500));
  }
};
