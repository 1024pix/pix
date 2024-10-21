import { logger } from '../../../../shared/infrastructure/utils/logger.js';

export async function convertCentersToV3({ isDryRun, preservedCenterIds, centerRepository }) {
  if (isDryRun) {
    logger.info('Dry run requested, no centers are actually converted');
    return;
  }
  const convertedCentersCount = await centerRepository.updateCentersToV3({ preservedCenterIds });
  logger.info(`${convertedCentersCount} centers successfully converted to v3`);
}
