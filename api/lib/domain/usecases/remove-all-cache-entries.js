module.exports = function removeAllCacheEntries({ cache }) {
  return cache.flushAll();
};
