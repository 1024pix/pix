const Cache = require('./Cache.js');
const RedisClient = require('../utils/RedisClient.js');

class DistributedCache extends Cache {
  constructor(underlyingCache, redisUrl, channel) {
    super();

    this._underlyingCache = underlyingCache;

    this._redisClientPublisher = new RedisClient(redisUrl, { name: 'distributed-cache-publisher' });
    this._redisClientSubscriber = new RedisClient(redisUrl, { name: 'distributed-cache-subscriber' });
    this._channel = channel;

    this._redisClientSubscriber.on('ready', () => {
      this._redisClientSubscriber.subscribe(this._channel);
    });
    this._redisClientSubscriber.on('message', () => {
      return this._underlyingCache.flushAll();
    });
  }

  get(key, generator) {
    return this._underlyingCache.get(key, generator);
  }

  set(key, object) {
    return this._underlyingCache.set(key, object);
  }

  flushAll() {
    return this._redisClientPublisher.publish(this._channel, 'Flush all');
  }

  quit() {
    return Promise.all([
      this._underlyingCache.quit(),
      this._redisClientPublisher.quit(),
      this._redisClientSubscriber.quit(),
    ]);
  }
}

module.exports = DistributedCache;
