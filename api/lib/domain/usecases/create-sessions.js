const sessionValidator = require('../validators/session-validator');
const { EntityValidationError, CertificationCandidatesImportError } = require('../errors');
const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');
const CertificationCandidate = require('../models/CertificationCandidate');
const sessionCodeService = require('../services/session-code-service');
const certificationCpfService = require('../services/certification-cpf-service');
const certificationSessionsService = require('../services/certification-sessions-service');
const dayjs = require('dayjs');
const bluebird = require('bluebird');

module.exports = async function createSessions({
  data,
  certificationCenterId,
  certificationCenterRepository,
  sessionRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  if (data.length === 0) {
    throw new UnprocessableEntityError('No data in table');
  }
  bluebird.mapSeries(data, async (line, index) => {
    if (_hasCandidateInformation(line)) {
      const cpfBirthInformation = await certificationCpfService.getBirthInformation({
        birthCountry: line['* Pays'],
        birthCity: line['Nom de la commune'],
        birthPostalCode: line['Code postal'],
        birthINSEECode: line['Code Insee'],
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

      if (cpfBirthInformation.hasFailed()) {
        const lineNumber = index + 1;
        throw new CertificationCandidatesImportError({
          message: `Ligne ${lineNumber} : ${cpfBirthInformation.message}`,
        });
      }
    }
  });

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

    const savedSessions = await sessionRepository.saveSessions(domainSessions);
    const dataWithSessionIds = certificationSessionsService.associateSessionIdToParsedData(data, savedSessions);

    dataWithSessionIds.map((data) => {
      return new CertificationCandidate({
        sessionId: data['sessionId'],
        lastName: data['* Nom de naissance'],
        firstName: data['* Prénom'],
        birthdate: dayjs(data['* Date de naissance (format: jj/mm/aaaa)'], 'DD/MM/YYYY').format('YYYY-MM-DD'),
        sex: data['* Sexe (M ou F)'],
        birthINSEECode: data['Code Insee'] ? data['Code Insee'] : null,
        birthPostalCode: data['Code postal'] ? data['Code postal'] : null,
        birthCity: data['Nom de la commune'],
        birthCountry: data['* Pays'],
        resultRecipientEmail: data['E-mail du destinataire des résultats (formateur, enseignant…)'],
        email: data['E-mail de convocation'],
        externalId: data['Identifiant local'],
        extraTimePercentage: data['Temps majoré ?'],
        billingMode: 'FREE',
      }).validate();
    });

    return;
  } catch (e) {
    throw new EntityValidationError(e);
  }
};

function _hasCandidateInformation(line) {
  const oneMandatoryColumn = '* Nom de naissance';
  return line[oneMandatoryColumn];
}
