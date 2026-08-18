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
 * @throws {SessionAlreadyPublishedError} the session is already published
 * @throws {NotFoundError} the finalized session does not exist or its access is restricted
 */
const unfinalizeSession = async function ({ sessionId, sessionManagementRepository, finalizedSessionRepository }) {
  return DomainTransaction.execute(async () => {
    const session = await sessionManagementRepository.get({ id: sessionId });

    if (!session) {
      throw new NotFoundError("La session n'existe pas ou son accès est restreint");
    }

    if (session.isPublished()) {
      throw new SessionAlreadyPublishedError();
    }

    await finalizedSessionRepository.remove({ sessionId });

    await sessionManagementRepository.unfinalize({ id: sessionId });
  });
};

export { unfinalizeSession };
