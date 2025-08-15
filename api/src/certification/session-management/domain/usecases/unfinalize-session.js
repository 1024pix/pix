/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').FinalizedSessionRepository} FinalizedSessionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedFinalizedSessionRepository from '../../infrastructure/repositories/finalized-session-repository.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';
import { SessionAlreadyPublishedError } from '../errors.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 */
const unfinalizeSession = async function ({
  sessionId,
  sessionRepository = injectedSessionRepository,
  finalizedSessionRepository = injectedFinalizedSessionRepository,
} = {}) {
  if (await sessionRepository.isPublished({ id: sessionId })) {
    throw new SessionAlreadyPublishedError();
  }

  return DomainTransaction.execute(async () => {
    await finalizedSessionRepository.remove({ sessionId });
    await sessionRepository.unfinalize({ id: sessionId });
  });
};

export { unfinalizeSession };
