const RedisClient = require('./RedisClient');

class DistributedCache {

  constructor(underlyingCache, redisUrl, channel) {

    this._underlyingCache = underlyingCache;

    this._redisClientPublisher = new RedisClient(redisUrl);
    this._redisClientSubscriber = new RedisClient(redisUrl);
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

}

module.exports = DistributedCache;
