const NodeCache = require('node-cache');
const RedisCache = require('./redis-cache');

let cache;

// TODO Discuter des différences entre NodeCache et RedisCache
// Redis sur les ReviewApps ?
if (process.env.REDIS_URL) {
  cache = new RedisCache(process.env.REDIS_URL);
} else {
  cache = new NodeCache();
}

module.exports = cache;
