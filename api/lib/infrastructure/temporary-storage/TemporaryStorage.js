import { v4 as uuidv4 } from 'uuid';

class TemporaryStorage {
  static generateKey() {
    return uuidv4();
  }

  async save(/* { key, value, expirationDelaySeconds } */) {
    throw new Error('Method #save({ key, value, expirationDelaySeconds }) must be overridden');
  }

  async update(/* key, value */) {
    throw new Error('Method #update(key, value) must be overridden');
  }

  async get(/* key */) {
    throw new Error('Method #get(key) must be overridden');
  }

  async delete(/* key */) {
    throw new Error('Method #delete(key) must be overridden');
  }

  async expire(/* { key, expirationDelaySeconds } */) {
    throw new Error('Method #expire({ key, expirationDelaySeconds }) must be overridden');
  }

  async ttl(/* key */) {
    throw new Error('Method #ttl(key) must be overridden');
  }

  async lpush(/* key, value */) {
    throw new Error('Method #lpush(key, value) must be overridden');
  }

  async lrem(/* key, valueToRemove */) {
    throw new Error('Method #lrem(key, valueToRemove) must be overridden');
  }

  async lrange(/* key, start, stop */) {
    throw new Error('Method #lrange(key) must be overridden');
  }

  quit() {
    throw new Error('Method #quit() must be overridden');
  }

  withPrefix(prefix) {
    const storage = this;
    return {
      async save({ key, ...args }) {
        key = key ?? TemporaryStorage.generateKey();
        await storage.save({ key: prefix + key, ...args });
        return key;
      },

      update(key, value) {
        return storage.update(prefix + key, value);
      },

      get(key) {
        return storage.get(prefix + key);
      },

      delete(key) {
        return storage.delete(prefix + key);
      },

      expire({ key, expirationDelaySeconds }) {
        return storage.expire({ key: prefix + key, expirationDelaySeconds });
      },

      ttl(key) {
        return storage.ttl(key);
      },

      lpush({ key, value }) {
        return storage.lpush(prefix + key, value);
      },

      lrem({ key, valueToRemove }) {
        return storage.lrem(prefix + key, valueToRemove);
      },

      lrange(key) {
        return storage.lrange(prefix + key);
      },
    };
  }
}

export default TemporaryStorage;
