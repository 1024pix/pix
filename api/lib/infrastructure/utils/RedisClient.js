const redis = require('redis');
const Redlock = require('redlock');
const { promisify } = require('util');
const logger = require('../logger');

const REDIS_CLIENT_OPTIONS = {};

module.exports = class RedisClient {
  constructor(redisUrl, { name, prefix } = {}) {
    this._clientName = name;

    this._prefix = prefix ?? '';

    this._client = redis.createClient(redisUrl, REDIS_CLIENT_OPTIONS);

    this._client.on('connect', () => logger.info({ redisClient: this._clientName }, 'Connected to server'));
    this._client.on('end', () => logger.info({ redisClient: this._clientName }, 'Disconnected from server'));
    this._client.on('error', (err) => logger.warn({ redisClient: this._clientName, err }, 'Error encountered'));

    this._clientWithLock = new Redlock(
      [this._client],
      // As said in the doc, setting retryCount to 0 and treating a failure as the resource being "locked"
      // is a good practice
      { retryCount: 0 }
    );

    this.set = promisify(this._wrapWithPrefix(this._client.set)).bind(this._client);
    this.del = promisify(this._wrapWithPrefix(this._client.del)).bind(this._client);
    this.ping = promisify(this._client.ping).bind(this._client);
    this.flushall = promisify(this._client.flushall).bind(this._client);
    this.lockDisposer = this._clientWithLock.disposer.bind(this._clientWithLock);
  }

  async get(key, ...args) {
    const promisifiedGet = promisify(this._client.get);
    let value = await promisifiedGet.call(this._client, this._prefix + key, ...args);
    if (!value) {
      value = await promisifiedGet.call(this._client, key, ...args);
    }
    return value;
  }

  _wrapWithPrefix(fn) {
    const prefix = this._prefix;
    return function (key, ...args) {
      return fn.call(this, prefix + key, ...args);
    };
  }

  subscribe(channel) {
    this._client.subscribe(channel, () =>
      logger.info({ redisClient: this._clientName }, `Subscribed to channel '${channel}'`)
    );
  }

  publish(channel, message) {
    this._client.publish(channel, message, () =>
      logger.info({ redisClient: this._clientName }, `Published on channel '${channel}'`)
    );
  }

  on(event, callback) {
    this._client.on(event, callback);
  }

  quit() {
    this._client.quit();
  }
};
