import { logger } from '../../../../shared/infrastructure/utils/logger.js';
/**
 * @typedef {import ('./index.js').CentersRepository} CentersRepository
 */

/**
 * @param {Object} params
 * @param {boolean} params.isDryRun
 * @param {preservedCenterIds} params.preservedCenterIds
 * @param {CentersRepository} params.centerRepository
 * @returns {Promise<void>}
 */
export async function convertCentersToV3({ isDryRun, preservedCenterIds, centerRepository }) {
  if (isDryRun) {
    logger.info('Dry run requested, no centers are actually converted');
    const centerIdsToConvert = await centerRepository.findV2CenterIds({ preservedCenterIds });
    logger.info(`${centerIdsToConvert.length} centers would have been converted`);
    logger.info(`Following centers would have been converted: ${centerIdsToConvert}`);
    return;
  }
  const convertedCentersCount = await centerRepository.updateCentersToV3({ preservedCenterIds });
  logger.info(`${convertedCentersCount} centers successfully converted to v3`);
}
