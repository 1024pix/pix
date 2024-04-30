import { SessionStartedDeletionError } from '../../../session/domain/errors.js';

/**
 * @typedef {import("./index.js").SessionManagementRepository} SessionManagementRepository
 * @typedef {import("./index.js").SessionRepository} SessionRepository
 */

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 */
const deleteSession = async function ({ sessionId, sessionRepository, sessionManagementRepository }) {
  if (!(await sessionManagementRepository.hasNoStartedCertification({ id: sessionId }))) {
    throw new SessionStartedDeletionError();
  }

  await sessionRepository.remove({ id: sessionId });
};

export { deleteSession };
