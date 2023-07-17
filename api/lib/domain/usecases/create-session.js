import { ForbiddenAccess } from '../errors.js';
import * as sessionValidator from '../validators/session-validator.js';
import * as sessionCodeService from '../services/session-code-service.js';
import { Session } from '../models/Session.js';
import { CertificationVersion } from '../models/CertificationVersion.js';

const createSession = async function ({
  userId,
  session,
  certificationCenterRepository,
  sessionRepository,
  userRepository,
  dependencies = { sessionValidator, sessionCodeService },
}) {
  dependencies.sessionValidator.validate(session);

  const certificationCenterId = session.certificationCenterId;
  const userWithCertifCenters = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!userWithCertifCenters.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess(
      "L'utilisateur n'est pas membre du centre de certification dans lequel il souhaite créer une session",
    );
  }

  const accessCode = dependencies.sessionCodeService.getNewSessionCode();
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
