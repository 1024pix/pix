import Redis from 'ioredis';
import Redlock from 'redlock';

import { logger } from '../logger.js';

class RedisClient {
  constructor(redisUrl, { name, prefix } = {}) {
    this._clientName = name;

    this._prefix = prefix ?? '';

    this._client = new Redis(redisUrl);

    this._client.on('connect', () => logger.info({ redisClient: this._clientName }, 'Connected to server'));
    this._client.on('end', () => logger.info({ redisClient: this._clientName }, 'Disconnected from server'));
    this._client.on('error', (err) => logger.warn({ redisClient: this._clientName, err }, 'Error encountered'));

    this._clientWithLock = new Redlock(
      [this._client],
      // As said in the doc, setting retryCount to 0 and treating a failure as the resource being "locked"
      // is a good practice
      { retryCount: 0 },
    );

    this.ttl = this._wrapWithPrefix(this._client.ttl).bind(this._client);
    this.get = this._wrapWithPrefix(this._client.get).bind(this._client);
    this.set = this._wrapWithPrefix(this._client.set).bind(this._client);
    this.del = this._wrapWithPrefix(this._client.del).bind(this._client);
    this.expire = this._wrapWithPrefix(this._client.expire).bind(this._client);
    this.lpush = this._wrapWithPrefix(this._client.lpush).bind(this._client);
    this.rpush = this._wrapWithPrefix(this._client.rpush).bind(this._client);
    this.lrem = this._wrapWithPrefix(this._client.lrem).bind(this._client);
    this.lrange = this._wrapWithPrefix(this._client.lrange).bind(this._client);
    this.ping = this._client.ping.bind(this._client);
    this.flushall = this._client.flushall.bind(this._client);
    this.lockDisposer = this._clientWithLock.disposer.bind(this._clientWithLock);
  }

  _wrapWithPrefix(fn) {
    const prefix = this._prefix;
    return function (key, ...args) {
      return fn.call(this, prefix + key, ...args);
    };
  }

  subscribe(channel) {
    this._client.subscribe(channel, () =>
      logger.info({ redisClient: this._clientName }, `Subscribed to channel '${channel}'`),
    );
  }

  publish(channel, message) {
    this._client.publish(channel, message, () =>
      logger.info({ redisClient: this._clientName }, `Published on channel '${channel}'`),
    );
  }

  on(event, callback) {
    this._client.on(event, callback);
  }

  async quit() {
    try {
      await this._client.quit();
    } catch (e) {
      if (e.message === 'Connection is closed.') {
        return;
      }
      logger.warn({ redisClient: this._clientName, err: e }, 'Error encountered while quitting');
    }
  }
}

export { RedisClient };
