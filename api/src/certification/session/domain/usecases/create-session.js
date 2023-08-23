import { Session } from '../../../../../lib/domain/models/Session.js';
import { CertificationVersion } from '../../../../../lib/domain/models/CertificationVersion.js';
import { ForbiddenAccess } from '../../../../shared/domain/errors.js';

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
