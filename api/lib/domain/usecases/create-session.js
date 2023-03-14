import { ForbiddenAccess } from '../errors.js';
import * as sessionValidator from '../validators/session-validator.js';
import * as sessionCodeService from '../services/session-code-service.js';
import { Session } from '../models/Session.js';

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
      "L'utilisateur n'est pas membre du centre de certification dans lequel il souhaite créer une session"
    );
  }

  const accessCode = dependencies.sessionCodeService.getNewSessionCode();
  const { name: certificationCenter } = await certificationCenterRepository.get(certificationCenterId);
  const domainSession = new Session({
    ...session,
    accessCode,
    certificationCenter,
  });

  return sessionRepository.save(domainSession);
};

export { createSession };
