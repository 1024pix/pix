const cache = require('../../infrastructure/caches/cache');
const usecases = require('../../domain/usecases');

module.exports = {

  removeCacheEntry(request, reply) {
    const cacheKey = request.params.cachekey;

    return usecases.removeCacheEntry({ cacheKey, cache })
      .then((numberOfDeletedKeys) => {
        if(numberOfDeletedKeys === 0) {
          return reply('Entry not found').code(404);
        }
        return reply('Entry successfully deleted').code(200);
      })
      .catch((error) => reply(error).code(500));
  },

  removeAllCacheEntries(request, reply) {
    return usecases.removeAllCacheEntries({ cache })
      .then(() => reply('Entries successfully deleted').code(200))
      .catch((error) => reply(error).code(500));
  }
};
