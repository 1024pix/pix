/**
 * @typedef {import ('./index.js').CentersRepository} CentersRepository
 * @typedef {import ('./index.js').ConvertScoCenterToV3JobRepository} ConvertScoCenterToV3JobRepository
 * @typedef {import ('../models/Center.js').Center} Center
 */

import { _ } from '../../../../shared/infrastructure/utils/lodash-utils.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { ConvertScoCenterToV3Job } from '../models/ConvertScoCenterToV3Job.js';

/**
 * @param {Object} params
 * @param {boolean} [params.isDryRun]
 * @param {CentersRepository} params.centerRepository
 * @param {ConvertScoCenterToV3JobRepository} params.convertScoCenterToV3JobRepository
 * @returns {Promise<number>} number of centers for which conversion has been requested
 */
export const findAndTriggerV2CenterToConvertInV3 = async ({
  isDryRun = false,
  centerRepository,
  convertScoCenterToV3JobRepository,
}) => {
  let numberOfConvertibleCenters = 0;
  let hasNext = false;
  let cursorId;

  do {
    const nextBatchOfCenters = await centerRepository.findSCOV2Centers({ cursorId });
    hasNext = !!nextBatchOfCenters.length;
    cursorId = _.last(nextBatchOfCenters)?.id;

    const convertibleCenters = _selectConvertibleCenters(nextBatchOfCenters);
    numberOfConvertibleCenters += convertibleCenters.length;
    logger.debug('Convertible centers:[%o]', convertibleCenters);

    if (!isDryRun) {
      await _sendConversionOrders({ centers: convertibleCenters, convertScoCenterToV3JobRepository });
    }
  } while (hasNext);

  if (isDryRun) {
    logger.warn('DRY_RUN: centers conversion to V3 have not been performed');
  }

  return numberOfConvertibleCenters;
};

/**
 * @param {Array<Center>} centers
 */
const _selectConvertibleCenters = (centers = []) => {
  return centers.filter((center) => !center.isInWhitelist());
};

/**
 * @param {Object} params
 * @param {Array<Center>} params.centers
 * @param {ConvertScoCenterToV3JobRepository} params.convertScoCenterToV3JobRepository
 */
const _sendConversionOrders = async ({ centers, convertScoCenterToV3JobRepository }) => {
  for (const center of centers) {
    await convertScoCenterToV3JobRepository.performAsync(new ConvertScoCenterToV3Job({ centerId: center.id }));
  }
};
