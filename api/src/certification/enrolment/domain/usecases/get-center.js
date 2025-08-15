import * as injectedCenterRepository from '../../infrastructure/repositories/center-repository.js'; /**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 */

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 */
const getCenter = function ({ id, centerRepository = injectedCenterRepository } = {}) {
  return centerRepository.getById({ id });
};

export { getCenter };
