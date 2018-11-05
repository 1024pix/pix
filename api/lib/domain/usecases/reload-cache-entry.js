module.exports = function reloadCacheEntry({ preloader, cacheKey }) {
  return preloader.loadKey(cacheKey);
};
