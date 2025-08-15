import * as injectedSessionManagementRepository from '../../../session-management/infrastructure/repositories/session-repository.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';
import { SessionStartedDeletionError } from '../errors.js';

/**
 * @typedef {import("./index.js").SessionManagementRepository} SessionManagementRepository
 * @typedef {import("./index.js").SessionRepository} SessionRepository
 */

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 */
const deleteSession = async function ({
  sessionId,
  sessionRepository = injectedSessionRepository,
  sessionManagementRepository = injectedSessionManagementRepository,
} = {}) {
  if (!(await sessionManagementRepository.hasNoStartedCertification({ id: sessionId }))) {
    throw new SessionStartedDeletionError();
  }

  await sessionRepository.remove({ id: sessionId });
};

export { deleteSession };
