const sessionValidator = require('../validators/session-validator');
const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');
const sessionCodeService = require('../services/session-code-service');
const certificationCpfService = require('../services/certification-cpf-service');
const CertificationCandidate = require('../models/CertificationCandidate');
const bluebird = require('bluebird');
const { InvalidCertificationCandidate } = require('../errors');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = async function createSessions({
  sessions,
  certificationCenterId,
  certificationCenterRepository,
  sessionRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  if (sessions.length === 0) {
    throw new UnprocessableEntityError('No session data in csv');
  }

  const { name: certificationCenter } = await certificationCenterRepository.get(certificationCenterId);

  await DomainTransaction.execute(async (domainTransaction) => {
    await bluebird.mapSeries(sessions, async (session) => {
      const accessCode = sessionCodeService.getNewSessionCodeWithoutAvailabilityCheck();
      const domainSession = new Session({
        ...session,
        certificationCenterId,
        certificationCenter,
        accessCode,
      });

      domainSession.generateSupervisorPassword();
      sessionValidator.validate(domainSession);
      const savedSession = await sessionRepository.save(domainSession, domainTransaction);

      await bluebird.mapSeries(domainSession.certificationCandidates, async (certificationCandidate) => {
        const domainCertificationCandidate = new CertificationCandidate({
          ...certificationCandidate,
          sessionId: savedSession.id,
        });

        domainCertificationCandidate.validate();

        const cpfBirthInformation = await certificationCpfService.getBirthInformation({
          birthCountry: domainCertificationCandidate.birthCountry,
          birthCity: domainCertificationCandidate.birthCity,
          birthPostalCode: domainCertificationCandidate.birthPostalCode,
          birthINSEECode: domainCertificationCandidate.birthINSEECode,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        if (cpfBirthInformation.hasFailed()) {
          throw new InvalidCertificationCandidate({ message: cpfBirthInformation.message, error: {} });
        }
      });

      return savedSession;
    });
  });
};
