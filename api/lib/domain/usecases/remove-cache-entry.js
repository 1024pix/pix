module.exports = function({ cacheKey, cache }) {
  return cache.del(cacheKey);
};
