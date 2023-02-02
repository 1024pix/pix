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
  certificationCandidateRepository,
  complementaryCertificationRepository,
}) {
  if (sessions.length === 0) {
    throw new UnprocessableEntityError('No session data in csv');
  }

  const { name: certificationCenter, isSco } = await certificationCenterRepository.get(certificationCenterId);

  for (const session of sessions) {
    const sessionAlreadyExisting = await sessionRepository.getExistingSessionByInformation({ ...session });
    if (sessionAlreadyExisting) {
      throw new UnprocessableEntityError(`Session happening on ${session.date} at ${session.time} already exists`);
    }
  }

  await DomainTransaction.execute(async (domainTransaction) => {
    await bluebird.mapSeries(sessions, async (session) => {
      let { sessionId } = session;
      let domainSession;

      if (sessionId) {
        domainSession = new Session({
          ...session,
          certificationCenterId,
          certificationCenter,
        });

        await _deleteExistingCandidatesInSession(certificationCandidateRepository, sessionId);
      }

      if (!sessionId) {
        domainSession = _createAndValidateNewSessionToSave(session, certificationCenterId, certificationCenter);
        const { id } = await _saveNewSessionReturningId(sessionRepository, domainSession, domainTransaction);
        sessionId = id;
      }

      if (domainSession.certificationCandidates.length) {
        await _createCertificationCandidates({
          domainSession,
          sessionId,
          isSco,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          complementaryCertificationRepository,
          certificationCandidateRepository,
          domainTransaction,
        });
      }

      return true;
    });
  });
};
async function _saveNewSessionReturningId(sessionRepository, domainSession, domainTransaction) {
  return await sessionRepository.save(domainSession, domainTransaction);
}

function _createAndValidateNewSessionToSave(session, certificationCenterId, certificationCenter) {
  const accessCode = sessionCodeService.getNewSessionCode();
  const domainSession = new Session({
    ...session,
    certificationCenterId,
    certificationCenter,
    accessCode,
  });

  domainSession.generateSupervisorPassword();
  sessionValidator.validate(domainSession);
  return domainSession;
}

async function _deleteExistingCandidatesInSession(certificationCandidateRepository, sessionId) {
  await certificationCandidateRepository.deleteBySessionId({ sessionId });
}

async function _createCertificationCandidates({
  domainSession,
  sessionId,
  isSco,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  certificationCandidateRepository,
  domainTransaction,
}) {
  await bluebird.mapSeries(domainSession.certificationCandidates, async (certificationCandidate) => {
    const billingMode = CertificationCandidate.translateBillingMode(certificationCandidate.billingMode);

    const domainCertificationCandidate = new CertificationCandidate({
      ...certificationCandidate,
      sessionId,
      billingMode,
    });

    domainCertificationCandidate.validate(isSco);

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

    domainCertificationCandidate.updateBirthInformation(cpfBirthInformation);

    if (domainCertificationCandidate.complementaryCertifications.length) {
      const complementaryCertification = await complementaryCertificationRepository.getByLabel({
        label: domainCertificationCandidate.complementaryCertifications[0],
      });

      domainCertificationCandidate.complementaryCertifications = [complementaryCertification];
    }

    await certificationCandidateRepository.saveInSession({
      sessionId,
      certificationCandidate: domainCertificationCandidate,
      domainTransaction,
    });
  });
}
