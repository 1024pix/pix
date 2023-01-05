const sessionValidator = require('../validators/session-validator');
const { EntityValidationError } = require('../errors');
const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');
const sessionCodeService = require('../services/session-code-service');

module.exports = async function createSessions({
  sessions,
  certificationCenterId,
  certificationCenterRepository,
  sessionRepository,
}) {
  if (sessions.length === 0) {
    throw new UnprocessableEntityError('No session data in csv');
  }

  const { name: certificationCenter } = await certificationCenterRepository.get(certificationCenterId);

  try {
    const domainSessions = sessions.map((session) => {
      const accessCode = sessionCodeService.getNewSessionCodeWithoutAvailabilityCheck();
      const domainSession = new Session({
        ...session,
        certificationCenterId,
        certificationCenter,
        accessCode,
      });

      domainSession.generateSupervisorPassword();
      sessionValidator.validate(domainSession);
      return domainSession;
    });

    await sessionRepository.saveSessions(domainSessions);
  } catch (e) {
    throw new EntityValidationError(e);
  }
  return;
};
