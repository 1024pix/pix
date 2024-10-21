import { logger } from '../../../../shared/infrastructure/utils/logger.js';

export async function convertSessionsWithNoCoursesToV3({ isDryRun, sessionsRepository }) {
  if (isDryRun) {
    logger.info('Dry run requested, no sessions are actually converted');
    return;
  }
  const convertedSessionsCount = await sessionsRepository.updateV2SessionsWithNoCourses();
  logger.info(`${convertedSessionsCount} sessions successfully converted to v3`);
}
