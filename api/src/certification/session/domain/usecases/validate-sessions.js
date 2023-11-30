/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps
 */

import { Session } from '../models/Session.js';
import { SessionMassImportReport } from '../models/SessionMassImportReport.js';
import { CertificationCandidate } from '../../../../../lib/domain/models/CertificationCandidate.js';
import bluebird from 'bluebird';

/**
 * @param {Object} params
 * @param {deps['certificationCenterRepository']} params.certificationCenterRepository
 * @param {deps['sessionRepository']} params.sessionRepository
 * @param {deps['certificationCpfCountryRepository']} params.certificationCpfCountryRepository
 * @param {deps['certificationCpfCityRepository']} params.certificationCpfCityRepository
 * @param {deps['complementaryCertificationRepository']} params.complementaryCertificationRepository
 * @param {deps['certificationCourseRepository']} params.certificationCourseRepository
 * @param {deps['sessionCodeService']} params.sessionCodeService
 * @param {deps['sessionsImportValidationService']} params.sessionsImportValidationService
 * @param {deps['temporarySessionsStorageForMassImportService']} params.temporarySessionsStorageForMassImportService
 */
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

    const certificationCandidateErrors = [];

    const { certificationCandidateComplementaryErrors, complementaryCertification } =
      await sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport({
        complementaryCertifications: certificationCandidate.complementaryCertifications,
        line: certificationCandidate.line,
        complementaryCertificationRepository,
      });

    certificationCandidateErrors.push(...certificationCandidateComplementaryErrors);

    const domainCertificationCandidate = new CertificationCandidate({
      ...certificationCandidate,
      sessionId,
      billingMode: billingMode || certificationCandidate.billingMode,
      complementaryCertification,
    });

    const candidateBirthInformationValidation =
      await sessionsImportValidationService.getValidatedCandidateBirthInformation({
        candidate: domainCertificationCandidate,
        isSco,
        isSessionsMassImport: true,
        line: certificationCandidate.line,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

    certificationCandidateErrors.push(...candidateBirthInformationValidation.certificationCandidateErrors);

    if (certificationCandidateErrors?.length > 0) {
      sessionsMassImportReport.addErrorReports(certificationCandidateErrors);
    } else {
      domainCertificationCandidate.updateBirthInformation(candidateBirthInformationValidation.cpfBirthInformation);
    }

    const candidateEmailsErrors = await sessionsImportValidationService.validateCandidateEmails({
      candidate: domainCertificationCandidate,
      line: certificationCandidate.line,
    });

    sessionsMassImportReport.addErrorReports(candidateEmailsErrors);

    return domainCertificationCandidate;
  });
}
