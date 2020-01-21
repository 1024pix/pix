class Cache {

  async get(/* key, generator */) {
    throw new Error('Method #get(key, generator) must be overridden');
  }

  async set(/* key, object */) {
    throw new Error('Method #set(key, object) must be overridden');
  }

  async flushAll() {
    throw new Error('Method #flushAll() must be overridden');
  }
}

module.exports = Cache;
