import { Session } from '../../models/Session.js';
import { SessionMassImportReport } from '../../models/SessionMassImportReport.js';
import { CertificationCandidate } from '../../models/CertificationCandidate.js';
import bluebird from 'bluebird';

const validateSessions = async function ({
  sessions,
  userId,
  certificationCenterId,
  certificationCenterRepository,
  sessionRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  certificationCourseRepository,
  sessionCodeService,
  i18n,
  sessionsImportValidationService,
  temporarySessionsStorageForMassImportService,
}) {
  const { name: certificationCenter, isSco } = await certificationCenterRepository.get(certificationCenterId);
  const sessionsMassImportReport = new SessionMassImportReport();
  const translate = i18n.__;

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
      certificationCenterId,
      sessionRepository,
      certificationCourseRepository,
    });

    sessionsMassImportReport.addErrorReports(sessionsErrors);

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
        translate,
        sessionsImportValidationService,
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

export { validateSessions };

async function _createValidCertificationCandidates({
  certificationCandidates,
  sessionId,
  isSco,
  sessionsMassImportReport,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  translate,
  sessionsImportValidationService,
}) {
  const { uniqueCandidates, duplicateCandidateErrors } =
    sessionsImportValidationService.getUniqueCandidates(certificationCandidates);
  if (duplicateCandidateErrors.length > 0) {
    sessionsMassImportReport.addErrorReports(duplicateCandidateErrors);
  }

  return bluebird.mapSeries(uniqueCandidates, async (certificationCandidate) => {
    const billingMode = CertificationCandidate.parseBillingMode({
      billingMode: certificationCandidate.billingMode,
      translate,
    });

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
      sessionsMassImportReport.addErrorReports(certificationCandidateErrors);
    } else {
      domainCertificationCandidate.updateBirthInformation(cpfBirthInformation);

      if (domainCertificationCandidate.complementaryCertification) {
        const complementaryCertification = await complementaryCertificationRepository.getByLabel({
          label: domainCertificationCandidate.complementaryCertification,
        });

        domainCertificationCandidate.complementaryCertification = complementaryCertification;
      }
    }

    return domainCertificationCandidate;
  });
}
