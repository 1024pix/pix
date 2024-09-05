/**
 * @typedef {import ('./index.js').CentersRepository} CentersRepository
 * @typedef {import ('./index.js').ConvertCenterToV3JobRepository} ConvertCenterToV3JobRepository
 */

import { ConvertCenterToV3Job } from '../models/ConvertCenterToV3Job.js';

/**
 * @param {Object} params
 * @param {CentersRepository} params.centersRepository
 * @param {ConvertCenterToV3JobRepository} params.convertCenterToV3JobRepository
 * @returns {Promise<number>} number of centers for which conversion has been requested
 */
export const findAndTriggerV2CenterToConvertInV3 = async ({ centersRepository, convertCenterToV3JobRepository }) => {
  let numberOfCenters = 0;
  let hasNext = false;
  let pageNumber = 1;

  do {
    const { centerIds, pagination } = await centersRepository.fetchSCOV2Centers({ pageNumber });
    numberOfCenters = pagination.rowCount;
    hasNext = !!centerIds.length;
    pageNumber++;

    await _sendConversionOrders(centerIds, convertCenterToV3JobRepository);
  } while (hasNext);

  return numberOfCenters;
};

/**
 * @param {Object} params
 * @param {ConvertCenterToV3JobRepository} params.convertCenterToV3JobRepository
 */
const _sendConversionOrders = async (centerIds, convertCenterToV3JobRepository) => {
  for (const centerId of centerIds) {
    await convertCenterToV3JobRepository.performAsync(new ConvertCenterToV3Job({ centerId }));
  }
};
