import lodash from 'lodash';
import micromatch from 'micromatch';
import NodeCache from 'node-cache';

const { trim, noop } = lodash;

import { TemporaryStorage } from '../../../src/shared/infrastructure/temporary-storage/TemporaryStorage.js';

class InMemoryTemporaryStorage extends TemporaryStorage {
  constructor() {
    super();
    this._client = new NodeCache();
  }

  async save({ key, value, expirationDelaySeconds }) {
    const storageKey = trim(key) || InMemoryTemporaryStorage.generateKey();
    this._client.set(storageKey, value, expirationDelaySeconds);
    return storageKey;
  }

  async update(key, value) {
    const storageKey = trim(key);
    const timeoutMs = this._client.getTtl(storageKey);
    const expirationDelaySeconds = timeoutMs === 0 ? 0 : (timeoutMs - Date.now()) / 1000;
    this._client.set(storageKey, value, expirationDelaySeconds);
  }

  async get(key) {
    return this._client.get(key);
  }

  async delete(key) {
    return this._client.del(key);
  }

  quit() {
    noop;
  }

  async expire({ key, expirationDelaySeconds }) {
    return this._client.ttl(key, expirationDelaySeconds);
  }

  async ttl(key) {
    return this._client.getTtl(key);
  }

  async lpush(key, value) {
    let list = this._client.get(key) || [];
    list = [value, ...list];
    this._client.set(key, list);
    return list.length;
  }

  async lrem(key, value) {
    const list = this._client.get(key) || [];
    const filtered = list.filter((item) => item !== value);
    const removed = list.filter((item) => item === value);
    this._client.set(key, filtered);
    return removed.length;
  }

  async lrange(key) {
    return this._client.get(key) || [];
  }

  keys(pattern) {
    return micromatch(this._client.keys(), pattern);
  }
}

export { InMemoryTemporaryStorage };
