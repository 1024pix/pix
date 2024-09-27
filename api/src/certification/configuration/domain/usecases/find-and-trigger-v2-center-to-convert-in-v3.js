/**
 * @typedef {import ('./index.js').CentersRepository} CentersRepository
 * @typedef {import ('./index.js').ConvertCenterToV3JobRepository} ConvertCenterToV3JobRepository
 */

import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { ConvertCenterToV3Job } from '../models/ConvertCenterToV3Job.js';

/**
 * @param {Object} params
 * @param {boolean} [params.isDryRun]
 * @param {CentersRepository} params.centerRepository
 * @param {ConvertCenterToV3JobRepository} params.convertCenterToV3JobRepository
 * @returns {Promise<number>} number of centers for which conversion has been requested
 */
export const findAndTriggerV2CenterToConvertInV3 = async ({
  isDryRun = false,
  centerRepository,
  convertCenterToV3JobRepository,
}) => {
  let numberOfCenters = 0;
  let hasNext = false;
  let pageNumber = 1;

  do {
    const { centerIds, pagination } = await centerRepository.findSCOV2Centers({ pageNumber });
    numberOfCenters = pagination.rowCount;
    hasNext = !!centerIds.length;
    pageNumber++;

    if (!isDryRun) {
      await _sendConversionOrders({ centerIds, convertCenterToV3JobRepository });
    }
  } while (hasNext);

  if (isDryRun) {
    logger.warn('DRY_RUN: centers conversion to V3 have not been performed');
  }

  return numberOfCenters;
};

/**
 * @param {Object} params
 * @param {ConvertCenterToV3JobRepository} params.convertCenterToV3JobRepository
 */
const _sendConversionOrders = async ({ centerIds, convertCenterToV3JobRepository }) => {
  for (const centerId of centerIds) {
    await convertCenterToV3JobRepository.performAsync(new ConvertCenterToV3Job({ centerId }));
  }
};
