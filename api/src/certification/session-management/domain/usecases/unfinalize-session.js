/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').FinalizedSessionRepository} FinalizedSessionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SessionAlreadyPublishedError } from '../errors.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 */
const unfinalizeSession = async function ({ sessionId, sessionRepository, finalizedSessionRepository }) {
  if (await sessionRepository.isPublished({ id: sessionId })) {
    throw new SessionAlreadyPublishedError();
  }

  return DomainTransaction.execute(async (domainTransaction) => {
    await finalizedSessionRepository.remove({ sessionId, domainTransaction });
    await sessionRepository.unfinalize({ id: sessionId, domainTransaction });
  });
};

export { unfinalizeSession };
