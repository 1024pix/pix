/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 */

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 */
const getCenter = function ({ id, centerRepository }) {
  return centerRepository.getById({ id });
};

export { getCenter };
