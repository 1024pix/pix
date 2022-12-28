const sessionValidator = require('../validators/session-validator');
const { EntityValidationError } = require('../errors');
const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');
const sessionCodeService = require('../services/session-code-service');
const certificationSessionsService = require('../services/certification-sessions-service');

module.exports = async function createSessions({
  data,
  certificationCenterId,
  certificationCenterRepository,
  sessionRepository,
}) {
  if (data.length === 0) {
    throw new UnprocessableEntityError('No data in table');
  }

  const { name: certificationCenter } = await certificationCenterRepository.get(certificationCenterId);

  const groupedSessions = certificationSessionsService.groupBySessions(data);

  try {
    const domainSessions = groupedSessions.map((data) => {
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
