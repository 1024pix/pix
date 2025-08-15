import * as injectedFinalizedSessionRepository from '../../infrastructure/repositories/finalized-session-repository.js';

const findFinalizedSessionsToPublish = function ({
  finalizedSessionRepository = injectedFinalizedSessionRepository,
  version,
} = {}) {
  return finalizedSessionRepository.findFinalizedSessionsToPublish({ version });
};

export { findFinalizedSessionsToPublish };
