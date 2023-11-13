/**
 * @typedef {import ('../../../shared/infrastructure/repositories/certification-center-repository.js')} certificationCenterRepository
 * @typedef {import ('../../../session/infrastructure/repositories/session-repository.js')} sessionRepository
 * @typedef {import ('../../../../../src/shared/infrastructure/repositories/user-repository.js')} userRepository
 * @typedef {import ('../../../session/domain/validators/session-validator.js')} sessionValidator
 * @typedef {import ('../../../session/domain/services/session-code-service.js')} sessionCodeService
 */

import { Session } from '../models/Session.js';
import { CertificationVersion } from '../../../../shared/domain/models/CertificationVersion.js';
import { ForbiddenAccess } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} deps
 * @param {certificationCenterRepository} deps.certificationCenterRepository
 * @param {sessionRepository} deps.sessionRepository
 * @param {userRepository} deps.userRepository
 * @param {sessionValidator} deps.sessionValidator
 * @param {sessionCodeService} deps.sessionCodeService
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
  });

  return sessionRepository.save(domainSession);
};

export { createSession };
