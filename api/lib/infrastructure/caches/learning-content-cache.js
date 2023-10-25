import { DistributedCache } from './DistributedCache.js';
import { InMemoryCache } from './InMemoryCache.js';
import { LayeredCache } from './LayeredCache.js';
import { RedisCache } from './RedisCache.js';
import { config } from '../../config.js';

const LEARNING_CONTENT_CHANNEL = 'Learning content';
const LEARNING_CONTENT_CACHE_KEY = 'LearningContent';

export class LearningContentCache {
  constructor(redisUrl) {
    if (redisUrl) {
      const distributedCache = new DistributedCache(new InMemoryCache(), redisUrl, LEARNING_CONTENT_CHANNEL);
      const redisCache = new RedisCache(redisUrl);

      this._underlyingCache = new LayeredCache(distributedCache, redisCache);
    } else {
      this._underlyingCache = new InMemoryCache();
    }
  }

  get(generator) {
    return this._underlyingCache.get(LEARNING_CONTENT_CACHE_KEY, generator);
  }

  set(object) {
    return this._underlyingCache.set(LEARNING_CONTENT_CACHE_KEY, object);
  }

  patch(patch) {
    return this._underlyingCache.patch(LEARNING_CONTENT_CACHE_KEY, patch);
  }

  flushAll() {
    return this._underlyingCache.flushAll();
  }

  quit() {
    return this._underlyingCache.quit();
  }

  static _instance = null;

  static defaultInstance() {
    return new LearningContentCache(config.caching.redisUrl);
  }

  static get instance() {
    if (!this._instance) {
      this._instance = this.defaultInstance();
    }
    return this._instance;
  }

  static set instance(_instance) {
    this._instance = _instance;
  }
}

export const learningContentCache = LearningContentCache.instance;
