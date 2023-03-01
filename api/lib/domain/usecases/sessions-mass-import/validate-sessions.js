const Session = require('../../models/Session');
const SessionMassImportReport = require('../../models/SessionMassImportReport');
const sessionCodeService = require('../../services/session-code-service');
const sessionsImportValidationService = require('../../services/sessions-mass-import/sessions-import-validation-service');
const temporarySessionsStorageForMassImportService = require('../../services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service');
const CertificationCandidate = require('../../models/CertificationCandidate');
const bluebird = require('bluebird');

module.exports = async function validateSessions({
  sessions,
  userId,
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

  const validatedSessions = await bluebird.mapSeries(sessions, async (sessionDTO) => {
    const { sessionId } = sessionDTO;

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

    if (session.certificationCandidates.length) {
      const { certificationCandidates } = session;
      const validatedCertificationCandidates = await _createValidCertificationCandidates({
        certificationCandidates,
        sessionId,
        isSco,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        complementaryCertificationRepository,
        certificationCandidateRepository,
      });

      session.certificationCandidates = validatedCertificationCandidates;
    }

    return session;
  });

  const sessionsWithoutCandidatesCount = validatedSessions.filter(
    (session) => session.certificationCandidates.length === 0
  ).length;
  const sessionsCount = validatedSessions.length;
  const candidatesCount = validatedSessions.reduce(
    (currentCandidateCount, currentSession) => currentCandidateCount + currentSession.certificationCandidates.length,
    0
  );

  const cachedValidatedSessionsKey = await temporarySessionsStorageForMassImportService.save({
    sessions: validatedSessions,
    userId,
  });

  const sessionMassImportReport = new SessionMassImportReport({
    cachedValidatedSessionsKey,
    sessionsCount,
    sessionsWithoutCandidatesCount,
    candidatesCount,
  });

  return sessionMassImportReport;
};

async function _createValidCertificationCandidates({
  certificationCandidates,
  sessionId,
  isSco,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
}) {
  return bluebird.mapSeries(certificationCandidates, async (certificationCandidate) => {
    const billingMode = CertificationCandidate.translateBillingMode(certificationCandidate.billingMode);

    const domainCertificationCandidate = new CertificationCandidate({
      ...certificationCandidate,
      sessionId,
      billingMode,
    });

    const cpfBirthInformation = await sessionsImportValidationService.getValidatedCandidateBirthInformation({
      candidate: domainCertificationCandidate,
      isSco,
      isSessionsMassImport: true,
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

    return domainCertificationCandidate;
  });
}
