const sessionValidator = require('../validators/session-validator');
const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');
const sessionCodeService = require('../services/session-code-service');
const certificationCpfService = require('../services/certification-cpf-service');
const CertificationCandidate = require('../models/CertificationCandidate');
const bluebird = require('bluebird');
const { InvalidCertificationCandidate, SessionWithIdAndInformationOnMassImportError } = require('../errors');
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

  await DomainTransaction.execute(async (domainTransaction) => {
    await bluebird.mapSeries(sessions, async (session) => {
      let { sessionId } = session;
      let domainSession;

      if (sessionId) {
        if (_hasSessionInfo(session)) {
          throw new SessionWithIdAndInformationOnMassImportError(
            `Merci de ne pas renseigner les informations de session pour la session: ${sessionId}`
          );
        } else {
          domainSession = new Session({
            ...session,
            certificationCenterId,
            certificationCenter,
          });

          await _deleteExistingCandidatesInSession({ certificationCandidateRepository, sessionId, domainTransaction });
        }
      }

      if (!sessionId && _hasSessionInfo(session)) {
        const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
        if (isSessionExisting) {
          throw new UnprocessableEntityError(`Session happening on ${session.date} at ${session.time} already exists`);
        }

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

function _hasSessionInfo(session) {
  return session.address || session.room || session.date || session.time || session.examiner;
}

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

async function _deleteExistingCandidatesInSession({ certificationCandidateRepository, sessionId, domainTransaction }) {
  await certificationCandidateRepository.deleteBySessionId({ sessionId, domainTransaction });
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
