import trim from 'lodash/trim';
import TemporaryStorage from './TemporaryStorage';
import RedisClient from '../utils/RedisClient';

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

  async quit() {
    await this._client.quit();
  }

  async expire({ key, expirationDelaySeconds }) {
    return this._client.expire(key, expirationDelaySeconds);
  }

  async lpush(key, valueToAdd) {
    return this._client.lpush(key, valueToAdd);
  }

  async ttl(key) {
    return this._client.ttl(key);
  }

  async lrem(key, valueToRemove, count = 0) {
    return this._client.lrem(key, count, valueToRemove);
  }

  async lrange(key, start = 0, stop = -1) {
    return this._client.lrange(key, start, stop);
  }
}

export default RedisTemporaryStorage;
