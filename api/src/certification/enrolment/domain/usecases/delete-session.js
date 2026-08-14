import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionStartedDeletionError } from '../errors.js';

/**
 * @typedef {import("./index.js").SessionManagementRepository} SessionManagementRepository
 * @typedef {import("./index.js").SessionRepository} SessionRepository
 */

/**
 * @param {object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 */
const deleteSession = async ({ sessionId, sessionRepository, sessionManagementRepository }) => {
  if (!(await sessionManagementRepository.hasNoStartedCertification({ id: sessionId }))) {
    throw new SessionStartedDeletionError();
  }

  await DomainTransaction.execute(async () => {
    const deletedSession = await sessionRepository.remove({ id: sessionId });

    if (!deletedSession) {
      throw new NotFoundError("La session n'existe pas ou son accès est restreint");
    }
  });
};

export { deleteSession };
