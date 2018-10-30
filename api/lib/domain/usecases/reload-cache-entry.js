module.exports = function reloadCacheEntry({ preloader, cacheKey, cache }) {
  return cache.del(cacheKey)
    .then(() => preloader.loadTable(cacheKey));
};
