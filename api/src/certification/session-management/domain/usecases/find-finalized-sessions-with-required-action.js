import * as injectedFinalizedSessionRepository from '../../infrastructure/repositories/finalized-session-repository.js';

const findFinalizedSessionsWithRequiredAction = function ({
  finalizedSessionRepository = injectedFinalizedSessionRepository,
  version,
} = {}) {
  return finalizedSessionRepository.findFinalizedSessionsWithRequiredAction({ version });
};

export { findFinalizedSessionsWithRequiredAction };
