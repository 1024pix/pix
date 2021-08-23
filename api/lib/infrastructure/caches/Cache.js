class Cache {

  // eslint-disable-next-line require-await
  async get(/* key, generator */) {
    throw new Error('Method #get(key, generator) must be overridden');
  }

  // eslint-disable-next-line require-await
  async set(/* key, object */) {
    throw new Error('Method #set(key, object) must be overridden');
  }

  // eslint-disable-next-line require-await
  async flushAll() {
    throw new Error('Method #flushAll() must be overridden');
  }
}

module.exports = Cache;
