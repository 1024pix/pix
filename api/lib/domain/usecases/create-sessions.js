const sessionValidator = require('../validators/session-validator');
const { EntityValidationError, ForbiddenAccess } = require('../errors');
const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');
const sessionCodeService = require('../services/session-code-service');

module.exports = async function createSessions({
  data,
  userId,
  certificationCenterId,
  certificationCenterRepository,
  sessionRepository,
  userRepository,
}) {
  if (data.length === 0) {
    throw new UnprocessableEntityError('No data in table');
  }

  const userWithCertifCenters = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!userWithCertifCenters.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess(
      "L'utilisateur n'est pas membre du centre de certification dans lequel il souhaite créer une session"
    );
  }

  const { name: certificationCenter } = await certificationCenterRepository.get(certificationCenterId);

  try {
    const domainSessions = data.map((data) => {
      const accessCode = sessionCodeService.getNewSessionCodeWithoutAvailabilityCheck();
      const domainSession = new Session({
        certificationCenterId,
        certificationCenter,
        address: data['* Nom du site'],
        room: data['* Nom de la salle'],
        date: data['* Date de début'],
        time: data['* Heure de début (heure locale)'],
        examiner: data['* Surveillant(s)'],
        description: data['Observations (optionnel)'],
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
