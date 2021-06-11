const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');
const TemporaryStorage = require('./TemporaryStorage');

class InMemoryTemporaryStorage extends TemporaryStorage {

  constructor() {
    super();
    this._client = new NodeCache();
  }

  save({ value, expirationDelaySeconds }) {
    const key = uuidv4();
    this._client.set(key, value, expirationDelaySeconds);
    return key;
  }

  get(key) {
    return this._client.get(key);
  }
}

module.exports = InMemoryTemporaryStorage;
