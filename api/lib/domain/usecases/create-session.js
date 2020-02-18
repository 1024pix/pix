const _ = require('lodash');
const { ForbiddenAccess } = require('../errors');
const sessionValidator = require('../validators/session-validator');
const sessionCodeService = require('../services/session-code-service');
const { statuses } = require('../models/Session');

module.exports = async function createSession({ userId, session, certificationCenterRepository, sessionRepository, userRepository }) {
  sessionValidator.validate(session);

  const certificationCenterId = session.certificationCenterId;
  const userWithCertifCenters = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!userWithCertifCenters.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess('L\'utilisateur n\'est pas membre du centre de certification dans lequel il souhaite créer une session');
  }

  const sessionWithCode = _.clone(session);
  sessionWithCode.accessCode = await sessionCodeService.getNewSessionCode();
  const certificationCenter = await certificationCenterRepository.get(certificationCenterId);
  sessionWithCode.certificationCenter = certificationCenter.name;
  sessionWithCode.status = statuses.CREATED;
  return sessionRepository.save(sessionWithCode);
};
