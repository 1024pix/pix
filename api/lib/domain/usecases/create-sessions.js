const Session = require('../models/Session');
const sessionCodeService = require('../services/session-code-service');
const sessionsImportValidationService = require('../services/sessions-import-validation-service');
const CertificationCandidate = require('../models/CertificationCandidate');
const bluebird = require('bluebird');
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
    await bluebird.mapSeries(sessions, async (sessionDTO) => {
      let { sessionId } = sessionDTO;

      const accessCode = sessionCodeService.getNewSessionCode();
      const session = new Session({
        ...sessionDTO,
        id: sessionId,
        certificationCenterId,
        certificationCenter,
        accessCode,
      });

      await sessionsImportValidationService.validateSession({
        session,
        sessionRepository,
        certificationCourseRepository,
      });

      if (sessionId) {
        await _deleteExistingCandidatesInSession({ certificationCandidateRepository, sessionId, domainTransaction });
      }

      if (!sessionId && _hasSessionInfo(sessionDTO)) {
        const { id } = await _saveNewSessionReturningId({
          sessionRepository,
          domainSession: session,
          domainTransaction,
        });
        sessionId = id;
      }

      if (session.certificationCandidates.length) {
        const { certificationCandidates } = session;

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

    const cpfBirthInformation = await sessionsImportValidationService.getValidatedCandidateBirthInformation({
      candidate: domainCertificationCandidate,
      isSco,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

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
