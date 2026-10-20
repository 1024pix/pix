import { logger as defaultLogger } from './utils/logger.js';

export function registerProcessErrorHandlers({ processRef = process, logger = defaultLogger } = {}) {
  processRef.on('unhandledRejection', (reason) => {
    logger.error({ error: reason, unhandled: true, origin: 'Unhandled promise rejection' });
  });

  processRef.on('uncaughtException', (error) => {
    logger.error({ error, unhandled: true, origin: 'Uncaught exception' });
  });
}
