const { ForbiddenAccess } = require('../errors.js');
const sessionValidator = require('../validators/session-validator.js');
const sessionCodeService = require('../services/session-code-service.js');
const Session = require('../models/Session.js');

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

  const accessCode = sessionCodeService.getNewSessionCode();
  const { name: certificationCenter } = await certificationCenterRepository.get(certificationCenterId);
  const domainSession = new Session({
    ...session,
    accessCode,
    certificationCenter,
  });

  return sessionRepository.save(domainSession);
};
