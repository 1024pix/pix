/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').FinalizedSessionRepository} FinalizedSessionRepository
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionAlreadyPublishedError } from '../errors.js';

/**
 * @param {object} params
 * @param {SessionManagementRepository} params.sessionManagementRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 */
const unfinalizeSession = async function ({ sessionId, sessionManagementRepository, finalizedSessionRepository }) {
  if (await sessionManagementRepository.isPublished({ id: sessionId })) {
    throw new SessionAlreadyPublishedError();
  }

  return DomainTransaction.execute(async () => {
    const nbFinalizedSessionsRemoved = await finalizedSessionRepository.remove({ sessionId });

    if (!nbFinalizedSessionsRemoved) {
      throw new NotFoundError("La session n'existe pas ou son accès est restreint");
    }

    await sessionManagementRepository.unfinalize({ id: sessionId });
  });
};

export { unfinalizeSession };
