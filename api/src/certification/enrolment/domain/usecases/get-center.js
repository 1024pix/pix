/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 */

/**
 * @param {object} params
 * @param {CenterRepository} params.centerRepository
 */
export function getCenter({ id, centerRepository }) {
  return centerRepository.getById({ id });
}
