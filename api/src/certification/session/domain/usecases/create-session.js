/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import ('../../../shared/domain/usecases/index.js').SessionRepository} SessionRepository
 * @typedef {import ('../../../shared/domain/usecases/index.js').UserRepository} UserRepository
 * @typedef {import ('../../../shared/domain/usecases/index.js').SessionValidator} SessionValidator
 * @typedef {import ('../../../shared/domain/usecases/index.js').SessionCodeService} SessionCodeService
 */

import { Session } from '../models/Session.js';
import { CertificationVersion } from '../../../../shared/domain/models/CertificationVersion.js';
import { ForbiddenAccess } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {UserRepository} params.userRepository
 * @param {SessionValidator} params.sessionValidator
 * @param {SessionCodeService} params.sessionCodeService
 */
const createSession = async function ({
  userId,
  session,
  certificationCenterRepository,
  sessionRepository,
  userRepository,
  sessionValidator,
  sessionCodeService,
}) {
  sessionValidator.validate(session);

  const certificationCenterId = session.certificationCenterId;
  const userWithCertifCenters = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!userWithCertifCenters.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess(
      "L'utilisateur n'est pas membre du centre de certification dans lequel il souhaite créer une session",
    );
  }

  const accessCode = sessionCodeService.getNewSessionCode();
  const { isV3Pilot, name: certificationCenterName } = await certificationCenterRepository.get(certificationCenterId);
  const version = isV3Pilot ? CertificationVersion.V3 : CertificationVersion.V2;

  const domainSession = new Session({
    ...session,
    accessCode,
    certificationCenter: certificationCenterName,
    version,
    createdBy: userId,
  });

  return sessionRepository.save(domainSession);
};

export { createSession };
