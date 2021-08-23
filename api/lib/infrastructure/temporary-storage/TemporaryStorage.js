class TemporaryStorage {
  // eslint-disable-next-line require-await
  async save(/* value, expirationDelaySeconds */) {
    throw new Error('Method #save({ value, expirationDelaySeconds }) must be overridden');
  }

  // eslint-disable-next-line require-await
  async get(/* key */) {
    throw new Error('Method #get(key) must be overridden');
  }
}

module.exports = TemporaryStorage;
