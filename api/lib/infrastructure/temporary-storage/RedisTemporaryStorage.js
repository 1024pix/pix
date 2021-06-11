const { v4: uuidv4 } = require('uuid');

const TemporaryStorage = require('./TemporaryStorage');
const RedisClient = require('../utils/RedisClient');

const EXPIRATION_PARAMETER = 'ex';

class RedisTemporaryStorage extends TemporaryStorage {

  constructor(redisUrl) {
    super();
    this._client = RedisTemporaryStorage.createClient(redisUrl);
  }

  static createClient(redisUrl) {
    return new RedisClient(redisUrl, 'temporary-storage');
  }

  async save({ value, expirationDelaySeconds }) {
    const key = uuidv4();
    const objectAsString = JSON.stringify(value);
    await this._client.set(key, objectAsString, EXPIRATION_PARAMETER, expirationDelaySeconds);
    return key;
  }

  async get(key) {
    const value = await this._client.get(key);
    return JSON.parse(value);
  }
}

module.exports = RedisTemporaryStorage;
