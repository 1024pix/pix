import NodeCache from 'node-cache';
import { Cache } from './Cache.js';
import _ from 'lodash';

class InMemoryCache extends Cache {
  constructor() {
    super();
    this._cache = new NodeCache({ useClones: false });
    this._queue = Promise.resolve();
  }

  quit() {
    this._cache.close();
  }

  async get(key, generator) {
    return this._syncGet(key, () =>
      this._chainPromise(() => {
        return this._syncGet(key, () => this._generateAndSet(key, generator));
      }),
    );
  }

  async set(key, value) {
    return this._chainPromise(() => {
      this._cache.set(key, value);
      return value;
    });
  }

  patch(key, patch) {
    const value = this._cache.get(key);
    if (value === undefined) return;
    if (patch.operation === 'assign') {
      _.set(value, patch.path, patch.value);
    } else if (patch.operation === 'push') {
      const arr = _.get(value, patch.path);
      arr.push(patch.value);
    }
  }

  async flushAll() {
    return this._chainPromise(() => {
      this._cache.flushAll();
    });
  }

  async _generateAndSet(key, generator) {
    const generatedValue = await generator();
    this._cache.set(key, generatedValue);
    return generatedValue;
  }

  async _chainPromise(fn) {
    const queuedPromise = this._queue.then(fn);
    this._queue = queuedPromise.catch(() => {
      return;
    });
    return queuedPromise;
  }

  _syncGet(key, generator) {
    const value = this._cache.get(key);
    if (value) return value;
    return generator();
  }
}

export { InMemoryCache };
