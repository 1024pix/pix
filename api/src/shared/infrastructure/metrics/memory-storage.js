import { MetricsStorage } from './storage.js';

export class MemoryMetricsStorage extends MetricsStorage {
  #map = new Map();

  increment(key, value) {
    if (this.#map.has(key)) {
      this.#map.set(key, this.#map.get(key) + value);
    } else {
      this.#map.set(key, value);
    }
  }
}
