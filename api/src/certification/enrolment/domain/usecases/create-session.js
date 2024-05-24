/**
 * @typedef {import ("./index.js").CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import ("./index.js").SessionRepository} SessionRepository
 * @typedef {import ("./index.js").SessionValidator} SessionValidator
 * @typedef {import ("./index.js").SessionCodeService} SessionCodeService
 */

import { CERTIFICATION_VERSIONS } from '../../../shared/domain/models/CertificationVersion.js';
import { SessionEnrolment } from '../models/SessionEnrolment.js';

/**
 * @param {Object} params
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionValidator} params.sessionValidator
 * @param {SessionCodeService} params.sessionCodeService
 */
const createSession = async function ({
  userId,
  session,
  certificationCenterRepository,
  sessionRepository,
  sessionValidator,
  sessionCodeService,
}) {
  sessionValidator.validate(session);

  const certificationCenterId = session.certificationCenterId;

  const accessCode = sessionCodeService.getNewSessionCode();
  const { isV3Pilot, name: certificationCenterName } = await certificationCenterRepository.get({
    id: certificationCenterId,
  });
  const version = isV3Pilot ? CERTIFICATION_VERSIONS.V3 : CERTIFICATION_VERSIONS.V2;

  const domainSession = new SessionEnrolment({
    ...session,
    accessCode,
    certificationCenter: certificationCenterName,
    version,
    createdBy: userId,
  });

  return sessionRepository.save({ session: domainSession });
};

export { createSession };
