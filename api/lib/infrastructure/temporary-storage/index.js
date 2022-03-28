const settings = require('../../config');
const REDIS_URL = settings.poleEmploi.temporaryStorage.redisUrl;

const InMemoryTemporaryStorage = require('./InMemoryTemporaryStorage');
const RedisTemporaryStorage = require('./RedisTemporaryStorage');

function _createTemporaryStorage() {
  if (REDIS_URL) {
    return new RedisTemporaryStorage(REDIS_URL);
  } else {
    return new InMemoryTemporaryStorage();
  }
}

module.exports = _createTemporaryStorage(); // export an instance of RedisTemporaryStorage or InMemoryTemporaryStorage (not a function)
