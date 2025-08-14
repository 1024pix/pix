import * as injectedCenterRepository from '../../infrastructure/repositories/center-repository.js'; /**
 * @typedef {import ('./index.js').CenterRepository} CenterRepository
 * @typedef {import ('../models/Center.js').Center} Center
 */

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 * @returns {Promise<Array<Center>>}
 */
export const exportScoWhitelist = async ({ centerRepository = injectedCenterRepository } = {}) => {
  return centerRepository.getWhitelist();
};
