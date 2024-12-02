import * as learningContentPubSub from '../caches/learning-content-pubsub.js';

export class LearningContentCache {
  #map;
  #pubSub;
  #name;

  /**
   * @param {{
   *   name: string
   *   pubSub: import('../caches/learning-content-pubsub.js').LearningContentPubSub
   *   map: Map
   * }} config
   * @returns
   */
  constructor({ name, pubSub = learningContentPubSub.getPubSub(), map = new Map() }) {
    this.#name = name;
    this.#pubSub = pubSub;
    this.#map = map;

    this.#subscribe();
  }

  get(key) {
    return this.#map.get(key);
  }

  set(key, value) {
    return this.#map.set(key, value);
  }

  delete(key) {
    return this.#pubSub.publish(this.#name, { type: 'delete', key });
  }

  clear() {
    return this.#pubSub.publish(this.#name, { type: 'clear' });
  }

  async #subscribe() {
    for await (const message of this.#pubSub.subscribe(this.#name)) {
      if (message.type === 'clear') this.#map.clear();
      if (message.type === 'delete') this.#map.delete(message.key);
    }
  }
}

export const learningContentCache = {
  async quit() {
    return learningContentPubSub.quit();
  },
};
