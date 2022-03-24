const { v4: uuidv4 } = require('uuid');

class TemporaryStorage {
  static generateKey() {
    return uuidv4();
  }

  async save(/* { key, value, expirationDelaySeconds } */) {
    throw new Error('Method #save({ key, value, expirationDelaySeconds }) must be overridden');
  }

  async get(/* key */) {
    throw new Error('Method #get(key) must be overridden');
  }

  async delete(/* key */) {
    throw new Error('Method #delete(key) must be overridden');
  }
}

module.exports = TemporaryStorage;
