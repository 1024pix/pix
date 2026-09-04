import lodash from 'lodash';

const { trim } = lodash;

import { RedisClient } from '../utils/RedisClient.js';
import { KeyValueStorage } from './KeyValueStorage.js';

const EXPIRATION_PARAMETER = 'ex';
const KEEPTTL_PARAMETER = 'keepttl';

class RedisKeyValueStorage extends KeyValueStorage {
  #prefix;

  constructor(redisUrl, prefix) {
    super();
    this.#prefix = prefix;
    this._client = RedisKeyValueStorage.createClient(redisUrl, prefix);
  }

  static createClient(redisUrl, prefix) {
    return new RedisClient(redisUrl, { name: prefix, prefix });
  }

  async save({ key, value, expirationDelaySeconds }) {
    const storageKey = trim(key) || RedisKeyValueStorage.generateKey();

    const objectAsString = JSON.stringify(value);
    if (expirationDelaySeconds) {
      await this._client.set(storageKey, objectAsString, EXPIRATION_PARAMETER, expirationDelaySeconds);
    } else {
      await this._client.set(storageKey, objectAsString);
    }
    return storageKey;
  }

  async increment(key) {
    const storageKey = trim(key);

    await this._client.incr(storageKey);
  }

  async decrement(key) {
    const storageKey = trim(key);

    await this._client.decr(storageKey);
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

  async sadd(key, ...values) {
    return this._client.sadd(key, ...values);
  }

  async smembers(key) {
    return this._client.smembers(key);
  }

  async keys(pattern) {
    const keys = await this._client.keys(pattern);
    return keys.map((key) => key.slice(this.#prefix.length));
  }

  async flushAll() {
    return this._client.flushall();
  }
}

export { RedisKeyValueStorage };
