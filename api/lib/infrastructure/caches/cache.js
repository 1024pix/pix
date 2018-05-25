const NodeCache = require('node-cache');
const RedisCache = require('./redis-cache');
const settings = require('../../settings');

let cache;

// TODO Discuter des différences entre NodeCache et RedisCache
// Redis sur les ReviewApps ?
if (settings.redisUrl) {
  cache = new RedisCache(settings.redisUrl);
} else {
  cache = new NodeCache();
}

module.exports = cache;
