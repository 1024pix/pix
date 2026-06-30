import { Metrics } from '../metrics/metrics.js';
import { getTopic } from '../pubsub.js';
import { child, SCOPES } from '../utils/logger.js';

const logger = child('learningcontent:cache', { event: SCOPES.LEARNING_CONTENT });

const metrics = {
  cacheSize: Metrics.createGauge({
    name: 'lc_cachesize',
    help: 'Learning content cache size',
    labelNames: ['table', 'cache'],
  }),
};

export class LearningContentCache {
  #map;
  #topic;
  #name;
  #metrics;

  /**
   * @param {{
   *   name: string
   *   topic: import('../pubsub.js').Topic
   *   map: Map
   * }} config
   * @returns
   */
  constructor({ name, topic = getTopic(name), map = new Map() }) {
    this.#name = name;
    this.#topic = topic;
    this.#map = map;

    const [tableName, cache] = name.split(':');
    const table = tableName.split('.').at(-1);
    this.#metrics = {
      cacheSize: metrics.cacheSize.labels({
        table,
        cache,
      }),
    };

    this.#topic.subscribe((message) => this.#onMessage(message));
  }

  get(key) {
    return this.#map.get(key);
  }

  set(key, value) {
    try {
      return this.#map.set(key, value);
    } finally {
      this.#metrics.cacheSize.set(this.#map.size);
    }
  }

  delete(key) {
    return this.#topic.publish({ type: 'delete', key });
  }

  clear() {
    return this.#topic.publish({ type: 'clear' });
  }

  #onMessage(message) {
    if (message.type === 'clear') {
      logger.debug({ cacheName: this.#name }, 'clearing cache');
      this.#map.clear();
      this.#metrics.cacheSize.set(0);
    }
    if (message.type === 'delete') {
      logger.debug({ cacheName: this.#name, key: message.key }, 'deleting cache key');
      this.#map.delete(message.key);
      this.#metrics.cacheSize.set(this.#map.size);
    }
  }
}
