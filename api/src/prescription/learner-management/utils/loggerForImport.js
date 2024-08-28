import { config } from '../../../shared/config.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';

export const loggerForImport = (message) => {
  if (config.import.logEnabled) {
    logger.info(message);
  }
};
