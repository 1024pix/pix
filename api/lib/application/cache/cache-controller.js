const cache = require('../../infrastructure/caches/cache');

module.exports = {

  removeCacheEntry(request, reply) {
    const cacheKey = request.params.cachekey;

    return cache.del(cacheKey)
      .then(() => reply('Entry successfully deleted').code(200))
      .catch(() => reply('Entry key is not found').code(404));
  },

  removeAllCacheEntries(request, reply) {
    return cache.flushAll()
      .then(() => reply('Entries successfully deleted').code(200))
      .catch(() => reply('Something went wrong').code(500));
  }
};
