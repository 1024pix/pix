const { ForbiddenAccess } = require('../errors');
const sessionValidator = require('../validators/session-validator');
const sessionCodeService = require('../services/session-code-service');

module.exports = async function createSession({
  userId,
  session,
  certificationCenterRepository,
  sessionRepository,
  userRepository,
}) {
  sessionValidator.validate(session);

  const certificationCenterId = session.certificationCenterId;
  const userWithCertifCenters = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!userWithCertifCenters.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess(
      "L'utilisateur n'est pas membre du centre de certification dans lequel il souhaite créer une session"
    );
  }

  const accessCode = await sessionCodeService.getNewSessionCode();
  const { name: certificationCenter } = await certificationCenterRepository.get(certificationCenterId);
  const sessionWithCode = {
    ...session,
    accessCode,
    certificationCenter,
  };
  return sessionRepository.save(sessionWithCode);
};
