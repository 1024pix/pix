//@ts-check
/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').SupervisorAccessRepository} SupervisorAccessRepository
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 */

import {
  CertificationCenterIsArchivedError,
  InvalidSessionSupervisingLoginError,
  SessionNotAccessible,
} from '../errors.js';

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {string} params.invigilatorPassword
 * @param {number} params.userId
 * @param {SessionRepository} params.sessionRepository
 * @param {SupervisorAccessRepository} params.supervisorAccessRepository
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 */
export const superviseSession = async ({
  sessionId,
  invigilatorPassword,
  userId,
  sessionRepository,
  supervisorAccessRepository,
  certificationCenterRepository,
}) => {
  const session = await sessionRepository.get({ id: sessionId });

  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

  if (!session.isSupervisable(invigilatorPassword)) {
    throw new InvalidSessionSupervisingLoginError();
  }

  if (!session.isAccessible()) {
    throw new SessionNotAccessible();
  }

  if (certificationCenter.archivedAt || certificationCenter.archivedBy) {
    throw new CertificationCenterIsArchivedError();
  }

  await supervisorAccessRepository.create({ sessionId, userId });
};
