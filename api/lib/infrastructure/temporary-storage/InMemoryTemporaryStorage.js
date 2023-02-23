const NodeCache = require('node-cache');
const trim = require('lodash/trim');
const TemporaryStorage = require('./TemporaryStorage.js');
const { noop } = require('lodash');

class InMemoryTemporaryStorage extends TemporaryStorage {
  constructor() {
    super();
    this._client = new NodeCache();
  }

  save({ key, value, expirationDelaySeconds }) {
    const storageKey = trim(key) || InMemoryTemporaryStorage.generateKey();
    this._client.set(storageKey, value, expirationDelaySeconds);
    return storageKey;
  }

  update(key, value) {
    const storageKey = trim(key);
    const timeoutMs = this._client.getTtl(storageKey);
    const expirationDelaySeconds = timeoutMs === 0 ? 0 : (timeoutMs - Date.now()) / 1000;
    this._client.set(storageKey, value, expirationDelaySeconds);
  }

  get(key) {
    return this._client.get(key);
  }

  delete(key) {
    return this._client.del(key);
  }

  quit() {
    noop;
  }

  expire({ key, expirationDelaySeconds }) {
    return this._client.ttl(key, expirationDelaySeconds);
  }

  ttl(key) {
    return this._client.getTtl(key);
  }

  lpush(key, value) {
    let list = this._client.get(key) || [];
    list = [value, ...list];
    this._client.set(key, list);
    return list.length;
  }

  lrem(key, value) {
    const list = this._client.get(key) || [];
    const filtered = list.filter((item) => item !== value);
    const removed = list.filter((item) => item === value);
    this._client.set(key, filtered);
    return removed.length;
  }

  lrange(key) {
    return this._client.get(key) || [];
  }
}

module.exports = InMemoryTemporaryStorage;
