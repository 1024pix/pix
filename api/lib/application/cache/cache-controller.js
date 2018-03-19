const cache = require('../../infrastructure/cache');

module.exports = {

  removeCacheEntry(request, reply) {
    const cacheKey = request.payload['cache-key'];

    const deletedEntriesCount = cache.del(cacheKey);

    if (!deletedEntriesCount) {
      return reply('Entry key is not found').code(404);
    }

    return reply('Entry successfully deleted').code(200);
  }
};
