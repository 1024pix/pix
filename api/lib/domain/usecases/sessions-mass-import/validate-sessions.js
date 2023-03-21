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
  complementaryCertificationRepository,
  certificationCourseRepository,
}) {
  const { name: certificationCenter, isSco } = await certificationCenterRepository.get(certificationCenterId);
  const sessionsMassImportReport = new SessionMassImportReport();

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

    const sessionsErrors = await sessionsImportValidationService.validateSession({
      session,
      line: sessionDTO.line,
      sessionRepository,
      certificationCourseRepository,
    });

    sessionsMassImportReport.addBlockingErrorReports(sessionsErrors);

    if (session.certificationCandidates.length) {
      const { certificationCandidates } = session;
      const validatedCertificationCandidates = await _createValidCertificationCandidates({
        certificationCandidates,
        sessionId,
        isSco,
        sessionsMassImportReport,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        complementaryCertificationRepository,
      });

      session.certificationCandidates = validatedCertificationCandidates;
    }

    return session;
  });

  if (sessionsMassImportReport.isValid) {
    const cachedValidatedSessionsKey = await temporarySessionsStorageForMassImportService.save({
      sessions: validatedSessions,
      userId,
    });
    sessionsMassImportReport.cachedValidatedSessionsKey = cachedValidatedSessionsKey;
  }

  sessionsMassImportReport.updateSessionsCounters(validatedSessions);

  return sessionsMassImportReport;
};

async function _createValidCertificationCandidates({
  certificationCandidates,
  sessionId,
  isSco,
  sessionsMassImportReport,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
}) {
  return await bluebird.mapSeries(certificationCandidates, async (certificationCandidate) => {
    const billingMode = CertificationCandidate.translateBillingMode(certificationCandidate.billingMode);

    const domainCertificationCandidate = new CertificationCandidate({
      ...certificationCandidate,
      sessionId,
      billingMode: billingMode || certificationCandidate.billingMode,
    });

    const { certificationCandidateErrors, cpfBirthInformation } =
      await sessionsImportValidationService.getValidatedCandidateBirthInformation({
        candidate: domainCertificationCandidate,
        isSco,
        isSessionsMassImport: true,
        line: certificationCandidate.line,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

    if (certificationCandidateErrors?.length > 0) {
      sessionsMassImportReport.addBlockingErrorReports(certificationCandidateErrors);
    } else {
      domainCertificationCandidate.updateBirthInformation(cpfBirthInformation);

      if (domainCertificationCandidate.complementaryCertifications.length) {
        const complementaryCertification = await complementaryCertificationRepository.getByLabel({
          label: domainCertificationCandidate.complementaryCertifications[0],
        });

        domainCertificationCandidate.complementaryCertifications = [complementaryCertification];
      }
    }

    return domainCertificationCandidate;
  });
}
