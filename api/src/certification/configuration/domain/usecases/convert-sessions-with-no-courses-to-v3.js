import { logger } from '../../../../shared/infrastructure/utils/logger.js';

export async function convertSessionsWithNoCoursesToV3({ isDryRun, sessionsRepository }) {
  if (isDryRun) {
    logger.info('Dry run requested, no sessions are actually converted');
    const sessionIdsToConvert = await sessionsRepository.findV2SessionIdsWithNoCourses();
    logger.info(`${sessionIdsToConvert.length} sessions would have been converted`);
    logger.info(`Following sessions would have been converted: ${sessionIdsToConvert}`);
    return;
  }
  const convertedSessionsCount = await sessionsRepository.updateV2SessionsWithNoCourses();
  logger.info(`${convertedSessionsCount} sessions successfully converted to v3`);
}
