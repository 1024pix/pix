const redis = require('redis');

class RedisCache {
  constructor(redis_url) {
    this.client = redis.createClient(redis_url);
  }

  set(key, object) {
    this.client.set(key, JSON.stringify(object));
  }

  get(key, callback) {
    this.client.get(key, (error, value) => {
      if (error) return callback(error);

      try {
        return callback(null, JSON.parse(value));
      } catch (error) {
        return callback(error);
      }
    });
  }

  del(key, callback) {
    this.client.del(key, callback);
  }

  flushAll() {
    this.client.flushall();
  }
}

module.exports = RedisCache;
