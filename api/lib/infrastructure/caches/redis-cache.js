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

      if (callback) {
        try {
          return callback(error, JSON.parse(value));

        } catch (err) {
          // if JSON.parse fails it gives a SyntaxError
          if (err instanceof SyntaxError) {
            return callback(error, value);
          }
          throw err;
        }
      } else {
        try {
          return JSON.parse(value);

        } catch (err) {
          // if JSON.parse fails it gives a SyntaxError
          if (err instanceof SyntaxError) {
            return value;
          }
          throw err;
        }
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
