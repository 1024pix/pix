class TemporaryStorage {
  async save(/* value, expirationDelaySeconds */) {
    throw new Error('Method #save({ value, expirationDelaySeconds }) must be overridden');
  }

  async get(/* key */) {
    throw new Error('Method #get(key) must be overridden');
  }
}

module.exports = TemporaryStorage;
