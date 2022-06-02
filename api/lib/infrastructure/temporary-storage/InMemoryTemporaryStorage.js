const NodeCache = require('node-cache');
const trim = require('lodash/trim');
const TemporaryStorage = require('./TemporaryStorage');

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

  get(key) {
    return this._client.get(key);
  }

  delete(key) {
    return this._client.del(key);
  }

  deleteByPrefix(prefix) {
    const keys = this._client.keys();
    const matchingKeys = keys.filter((key) => key.startsWith(prefix));
    return this._client.del(matchingKeys);
  }
}

module.exports = InMemoryTemporaryStorage;
