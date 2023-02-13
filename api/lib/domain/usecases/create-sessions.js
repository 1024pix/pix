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
  certificationCourseRepository,
}) {
  const { name: certificationCenter, isSco } = await certificationCenterRepository.get(certificationCenterId);

  await DomainTransaction.execute(async (domainTransaction) => {
    await bluebird.mapSeries(sessions, async (session) => {
      let { sessionId } = session;
      const { date, time } = session;

      const domainSession = new Session({
        ...session,
        certificationCenterId,
        certificationCenter,
      });

      if (domainSession.isSessionScheduledInThePast()) {
        throw new UnprocessableEntityError(`Une session ne peut pas être programmée dans le passé`);
      }

      if (sessionId) {
        if (await _isSessionStarted({ certificationCourseRepository, sessionId })) {
          throw new UnprocessableEntityError("Impossible d'ajouter un candidat à une session qui a déjà commencé.");
        }

        if (_hasSessionInfo(session)) {
          throw new SessionWithIdAndInformationOnMassImportError(
            `Merci de ne pas renseigner les informations de session pour la session: ${sessionId}`
          );
        }

        await _deleteExistingCandidatesInSession({ certificationCandidateRepository, sessionId, domainTransaction });
      }

      if (!sessionId && _hasSessionInfo(session)) {
        const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
        if (isSessionExisting) {
          throw new UnprocessableEntityError(`Session happening on ${date} at ${time} already exists`);
        }

        _validateNewSessionToSave({ domainSession, certificationCenterId, certificationCenter });
        const { id } = await _saveNewSessionReturningId({ sessionRepository, domainSession, domainTransaction });
        sessionId = id;
      }

      if (domainSession.certificationCandidates.length) {
        const { certificationCandidates } = domainSession;

        if (_hasDuplicateCertificationCandidates(certificationCandidates)) {
          throw new UnprocessableEntityError(`Une session contient au moins un élève en double.`);
        }

        await _createCertificationCandidates({
          certificationCandidates,
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

async function _saveNewSessionReturningId({ sessionRepository, domainSession, domainTransaction }) {
  return await sessionRepository.save(domainSession, domainTransaction);
}

function _validateNewSessionToSave({ domainSession, certificationCenterId, certificationCenter }) {
  domainSession.accessCode = sessionCodeService.getNewSessionCode();
  domainSession.certificationCenterId = certificationCenterId;
  domainSession.certificationCenter = certificationCenter;

  domainSession.generateSupervisorPassword();
  sessionValidator.validate(domainSession);
}

function _hasDuplicateCertificationCandidates(certificationCandidates) {
  const uniqCertificationCandidates = new Set(
    certificationCandidates.map(({ lastName, firstName, birthdate }) => `${lastName}${firstName}${birthdate}`)
  );

  return uniqCertificationCandidates.size < certificationCandidates.length;
}

async function _isSessionStarted({ certificationCourseRepository, sessionId }) {
  const foundCertificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });
  return foundCertificationCourses.length > 0;
}

async function _deleteExistingCandidatesInSession({ certificationCandidateRepository, sessionId, domainTransaction }) {
  await certificationCandidateRepository.deleteBySessionId({ sessionId, domainTransaction });
}

async function _createCertificationCandidates({
  certificationCandidates,
  sessionId,
  isSco,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  certificationCandidateRepository,
  domainTransaction,
}) {
  await bluebird.mapSeries(certificationCandidates, async (certificationCandidate) => {
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
