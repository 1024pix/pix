import lodash from 'lodash';

const { trim, noop } = lodash;

import { KeyValueStorage } from './KeyValueStorage.js';

class InMemoryKeyValueStorage extends KeyValueStorage {
  #store = new Map();

  constructor() {
    super();
  }

  async save({ key, value, expirationDelaySeconds }) {
    const storageKey = trim(key) || InMemoryKeyValueStorage.generateKey();
    if (expirationDelaySeconds) {
      setTimeout(() => this.#store.delete(storageKey), expirationDelaySeconds * 1000);
    }
    this.#store.set(storageKey, value);
    return storageKey;
  }

  async update(key, value) {
    const storageKey = trim(key);
    this.#store.set(storageKey, value);
  }

  async get(key) {
    return this.#store.get(key);
  }

  async increment(key) {
    let value = Number(this.get(key));
    if (Number.isNaN(value)) {
      value = 0;
    }
    this.update(key, `${value + 1}`);
  }

  async decrement(key) {
    let value = Number(this.get(key));
    if (Number.isNaN(value)) {
      value = 0;
    }
    this.update(key, `${value - 1}`);
  }

  async delete(key) {
    return this.#store.delete(key);
  }

  quit() {
    noop;
  }

  async expire() {
    noop;
  }

  async ttl() {
    return 0;
  }

  async lpush(key, value) {
    let list = this.#store.get(key) || [];
    list = [value, ...list];
    this.#store.set(key, list);
    return list.length;
  }

  async lrem(key, value) {
    const list = this.#store.get(key) || [];
    const filtered = list.filter((item) => item !== value);
    const removed = list.filter((item) => item === value);
    this.#store.set(key, filtered);
    return removed.length;
  }

  async lrange(key) {
    return this.#store.get(key) || [];
  }

  keys(pattern) {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return Array.from(this.#store.keys()).filter((key) => regex.test(key));
  }

  async flushAll() {
    this.#store.clear();
  }
}

export { InMemoryKeyValueStorage };
