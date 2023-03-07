const settings = require('../../config.js');
const REDIS_URL = settings.temporaryStorage.redisUrl;

const InMemoryTemporaryStorage = require('./InMemoryTemporaryStorage.js');
const RedisTemporaryStorage = require('./RedisTemporaryStorage.js');

function _createTemporaryStorage() {
  if (REDIS_URL) {
    return new RedisTemporaryStorage(REDIS_URL);
  } else {
    return new InMemoryTemporaryStorage();
  }
}

const temporaryStorage = _createTemporaryStorage();

module.exports = { temporaryStorage };
