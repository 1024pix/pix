import { Cache } from './Cache.js';
import { RedisClient } from '../utils/RedisClient.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';

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
    this._redisClientSubscriber.on('message', this.clientSubscriberCallback.bind(this));
  }

  clientSubscriberCallback(message) {
    // TODO: utiliser un message au format JSON pour le flushall également
    if (message === 'Flush all') {
      logger.info({ event: 'cache-event' }, 'Flushing the local cache');
      return this._underlyingCache.flushAll();
    } else {
      logger.info({ event: 'cache-event' }, 'Patching the local cache');
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === 'patch') {
        this._underlyingCache.patch(parsedMessage.cacheKey, parsedMessage.patch);
      }
    }
  }

  get(key, generator) {
    return this._underlyingCache.get(key, generator);
  }

  set(key, object) {
    return this._underlyingCache.set(key, object);
  }

  patch(key, object) {
    const message = {
      patch: object,
      cacheKey: key,
      type: 'patch',
    };
    const messageAsString = JSON.stringify(message);
    this._redisClientPublisher.publish(this._channel, messageAsString);
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

export { DistributedCache };
