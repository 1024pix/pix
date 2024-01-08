/**
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionRepository} SessionRepository
 * @typedef {import('../../../shared/domain/usecases/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 */

import { SessionAlreadyPublishedError } from '../errors.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 */
const unfinalizeSession = async function ({ sessionId, sessionRepository, finalizedSessionRepository }) {
  if (await sessionRepository.isPublished(sessionId)) {
    throw new SessionAlreadyPublishedError();
  }

  return DomainTransaction.execute(async (domainTransaction) => {
    await finalizedSessionRepository.delete({ sessionId, domainTransaction });
    await sessionRepository.unfinalize({ sessionId, domainTransaction });
  });
};

export { unfinalizeSession };
