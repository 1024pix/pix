module.exports = function reloadCacheEntry({ preloader, tableName, recordId }) {
  return preloader.load({ tableName, recordId });
};
