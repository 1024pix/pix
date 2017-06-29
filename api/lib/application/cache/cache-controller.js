const cache = require('../../infrastructure/cache');

module.exports = {

  removeCacheEntry(request, reply) {
    const deletedEntriesCount = cache.del(request.payload['cache-key']);

    if(!deletedEntriesCount) {
      return reply('Entry key is not found').code(404);
    }

    return reply('Entry successfully deleted').code(200);
  }
};
