const redis = require('redis');
const settings = require('../../config');
const { promisify } = require('util');

const KEY_PREFIX = 'authentication_';
const expirationDelaySeconds = 10;

class PoleEmploiAuthenticationTemporaryStorage {

  constructor() {
    this._client = redis.createClient(settings.caching.redisUrl);
    this._del = promisify(this._client.del).bind(this._client);
    this._get = promisify(this._client.get).bind(this._client);
    this._set = promisify(this._client.set).bind(this._client);
  }

  async getdel(key) {
    const value = await this._get(KEY_PREFIX + key);
    await this._del(KEY_PREFIX + key);
    return value;
  }

  async set(key, object) {
    const finalKey = KEY_PREFIX + key;
    await this._set(finalKey, object, 'EX', expirationDelaySeconds);
  }

}

module.exports = new PoleEmploiAuthenticationTemporaryStorage();
