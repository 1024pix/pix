/**
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionRepository} SessionRepository
 * @typedef {import('../../../shared/domain/usecases/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 */
const unfinalizeSession = async function ({ sessionId, sessionRepository, finalizedSessionRepository }) {
  return DomainTransaction.execute(async (domainTransaction) => {
    await finalizedSessionRepository.delete({ sessionId, domainTransaction });
    await sessionRepository.unfinalize({ sessionId, domainTransaction });
  });
};

export { unfinalizeSession };
