import { LRUCache } from 'lru-cache';

/**
 * @template {NonNullable<unknown>} K
 * @template {NonNullable<unknown>} V
 *
 * @param {{
 *   max: number,
 * }} options
 * @returns {import('lru-cache').LRUCache<K, V>}
 */
export function createLRUCache({ max }) {
  return new LRUCache({ max });
}
