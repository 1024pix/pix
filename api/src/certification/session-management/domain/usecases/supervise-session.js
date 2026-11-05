//@ts-check
/**
 * @typedef {import('./index.js').SessionAuthorizationInfoRepository} SessionAuthorizationInfoRepository
 * @typedef {import('./index.js').InvigilatorAccessRepository} InvigilatorAccessRepository
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('./index.js').CertificationCenterAccessRepository} CertificationCenterAccessRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';
import {
  CertificationCenterIsArchivedError,
  InvalidSessionSupervisingLoginError,
  SessionFinalized,
  SessionNotJoinable,
} from '../errors.js';

/**
 * @param {object} params
 * @param {number} params.sessionId
 * @param {string} params.invigilatorPassword
 * @param {number} params.userId
 * @param {SessionAuthorizationInfoRepository} params.sessionAuthorizationInfoRepository
 * @param {InvigilatorAccessRepository} params.invigilatorAccessRepository
 * @param {CertificationCenterAccessRepository} params.certificationCenterAccessRepository
 */
export async function superviseSession({
  sessionId,
  invigilatorPassword,
  userId,
  invigilatorAccessRepository,
  certificationCenterAccessRepository,
  sessionAuthorizationInfoRepository,
}) {
  const sessionAuthorizationInfo = await sessionAuthorizationInfoRepository.findBySessionId({
    sessionId,
  });
  if (!sessionAuthorizationInfo) {
    throw new NotFoundError('Session not found.');
  }

  if (!sessionAuthorizationInfo.canJoin) {
    if (sessionAuthorizationInfo.certificationCenterArchived) {
      throw new CertificationCenterIsArchivedError();
    }
    throw new SessionFinalized();
  }

  const certificationCenterAccess = await certificationCenterAccessRepository.getCertificationCenterAccess({
    certificationCenterId: sessionAuthorizationInfo.certificationCenterId,
  });

  if (certificationCenterAccess.isAccessBlockedCollege) {
    throw new SessionNotJoinable(certificationCenterAccess.pixCertifScoBlockedAccessDateCollege);
  }

  if (certificationCenterAccess.isAccessBlockedLycee) {
    throw new SessionNotJoinable(certificationCenterAccess.pixCertifScoBlockedAccessDateLycee);
  }

  if (certificationCenterAccess.isAccessBlockedAEFE) {
    throw new SessionNotJoinable(certificationCenterAccess.pixCertifScoBlockedAccessDateLycee);
  }

  if (certificationCenterAccess.isAccessBlockedAgri) {
    throw new SessionNotJoinable(certificationCenterAccess.pixCertifScoBlockedAccessDateLycee);
  }

  if (!sessionAuthorizationInfo.isPasswordValid(invigilatorPassword)) {
    throw new InvalidSessionSupervisingLoginError();
  }

  await invigilatorAccessRepository.create({ sessionId, userId });
}
