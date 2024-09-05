/**
 * @typedef {import ('./index.js').CentersRepository} CentersRepository
 * @typedef {import ('./index.js').ConvertCenterToV3JobRepository} ConvertCenterToV3JobRepository
 */

import { ConvertCenterToV3Job } from '../models/ConvertCenterToV3Job.js';

/**
 * @param {Object} params
 * @param {CentersRepository} params.centersRepository
 * @param {ConvertCenterToV3JobRepository} params.convertCenterToV3JobRepository
 * @returns {Promise<Array<number>>} center identifiers for which conversion has been requested
 */
export const findAndTriggerV2CenterToConvertInV3 = async ({ centersRepository, convertCenterToV3JobRepository }) => {
  const v2CenterIds = await centersRepository.fetchSCOV2Centers();
  for (const centerId of v2CenterIds) {
    await convertCenterToV3JobRepository.performAsync(new ConvertCenterToV3Job({ centerId }));
  }
  return v2CenterIds;
};
