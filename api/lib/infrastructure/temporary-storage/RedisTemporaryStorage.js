const trim = require('lodash/trim');

const TemporaryStorage = require('./TemporaryStorage');
const RedisClient = require('../utils/RedisClient');

const EXPIRATION_PARAMETER = 'ex';
const KEEPTTL_PARAMETER = 'keepttl';

class RedisTemporaryStorage extends TemporaryStorage {
  constructor(redisUrl) {
    super();
    this._client = RedisTemporaryStorage.createClient(redisUrl);
  }

  static createClient(redisUrl) {
    return new RedisClient(redisUrl, { name: 'temporary-storage', prefix: 'temporary-storage:' });
  }

  async save({ key, value, expirationDelaySeconds }) {
    const storageKey = trim(key) || RedisTemporaryStorage.generateKey();

    const objectAsString = JSON.stringify(value);
    await this._client.set(storageKey, objectAsString, EXPIRATION_PARAMETER, expirationDelaySeconds);
    return storageKey;
  }

  async update(key, value) {
    const storageKey = trim(key);

    const objectAsString = JSON.stringify(value);
    await this._client.set(storageKey, objectAsString, KEEPTTL_PARAMETER);
  }

  async get(key) {
    const value = await this._client.get(key);
    return JSON.parse(value);
  }

  async delete(key) {
    await this._client.del(key);
  }

  async deleteByPrefix(prefix) {
    await this._client.deleteByPrefix(prefix);
  }

  quit() {
    this._client.quit();
  }
}

module.exports = RedisTemporaryStorage;
