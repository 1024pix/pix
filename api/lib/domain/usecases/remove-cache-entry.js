module.exports = function removeCacheEntry({ cacheKey, cache }) {
  return cache.del(cacheKey);
};
