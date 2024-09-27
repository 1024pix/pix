/**
 * @typedef {import ("./index.js").dependencies} deps
 */

import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { Candidate } from '../models/Candidate.js';
import { SessionEnrolment } from '../models/SessionEnrolment.js';
import { SessionMassImportReport } from '../models/SessionMassImportReport.js';

/**
 * @param {Object} params
 * @param {deps["sessionRepository"]} params.sessionRepository
 * @param {deps["certificationCpfCountryRepository"]} params.certificationCpfCountryRepository
 * @param {deps["certificationCpfCityRepository"]} params.certificationCpfCityRepository
 * @param {deps["complementaryCertificationRepository"]} params.complementaryCertificationRepository
 * @param {deps["certificationCourseRepository"]} params.certificationCourseRepository
 * @param {deps["sessionCodeService"]} params.sessionCodeService
 * @param {deps["sessionManagementRepository"]} params.sessionManagementRepository
 * @param {deps["sessionsImportValidationService"]} params.sessionsImportValidationService
 * @param {deps["temporarySessionsStorageForMassImportService"]} params.temporarySessionsStorageForMassImportService
 */

const validateSessions = async function ({
  sessionsData,
  userId,
  certificationCenterId,
  centerRepository,
  sessionRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  certificationCourseRepository,
  sessionCodeService,
  sessionManagementRepository,
  i18n,
  sessionsImportValidationService,
  temporarySessionsStorageForMassImportService,
}) {
  const center = await centerRepository.getById({ id: certificationCenterId });
  const sessionsMassImportReport = new SessionMassImportReport();
  const translate = i18n.__;

  const validatedSessions = await PromiseUtils.mapSeries(sessionsData, async (sessionDTO) => {
    const { sessionId } = sessionDTO;

    const accessCode = sessionCodeService.getNewSessionCode();
    const session = new SessionEnrolment({
      ...sessionDTO,
      certificationCandidates: [],
      id: sessionId,
      certificationCenterId,
      certificationCenter: center.name,
      certificationCenterType: center.type,
      accessCode,
    });

    const sessionsErrors = await sessionsImportValidationService.validateSession({
      session,
      candidatesData: sessionDTO.candidates,
      line: sessionDTO.line,
      certificationCenterId,
      sessionRepository,
      certificationCourseRepository,
      sessionManagementRepository,
    });

    sessionsMassImportReport.addErrorReports(sessionsErrors);

    if (sessionDTO.candidates.length) {
      const { candidates: candidatesDTO } = sessionDTO;
      const validatedCandidates = await _createValidCertificationCandidates({
        candidatesDTO,
        sessionId,
        isSco: session.isSco,
        sessionsMassImportReport,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        complementaryCertificationRepository,
        translate,
        sessionsImportValidationService,
        isCoreComplementaryCompatibilityEnabled: center.isCoreComplementaryCompatibilityEnabled,
      });

      session.certificationCandidates = validatedCandidates;
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
  candidatesDTO,
  sessionId,
  isSco,
  sessionsMassImportReport,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  translate,
  sessionsImportValidationService,
  isCoreComplementaryCompatibilityEnabled,
}) {
  const { uniqueCandidates, duplicateCandidateErrors } =
    sessionsImportValidationService.getUniqueCandidates(candidatesDTO);
  if (duplicateCandidateErrors.length > 0) {
    sessionsMassImportReport.addErrorReports(duplicateCandidateErrors);
  }

  return PromiseUtils.mapSeries(uniqueCandidates, async (candidateDTO) => {
    const billingMode = Candidate.parseBillingMode({
      billingMode: candidateDTO.billingMode,
      translate,
    });

    const certificationCandidateErrors = [];

    const { certificationCandidateComplementaryErrors, subscriptions } =
      await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
        subscriptionLabels: candidateDTO.subscriptionLabels,
        line: candidateDTO.line,
        complementaryCertificationRepository,
        isCoreComplementaryCompatibilityEnabled,
      });

    certificationCandidateErrors.push(...certificationCandidateComplementaryErrors);

    const candidate = new Candidate({
      ...candidateDTO,
      sessionId,
      billingMode: billingMode || candidateDTO.billingMode,
      subscriptions,
      id: null,
      userId: null,
      reconciledAt: null,
      organizationLearnerId: null,
      createdAt: null,
    });

    const candidateBirthInformationValidation = await sessionsImportValidationService.getValidatedCandidateInformation({
      candidate,
      isSco,
      isSessionsMassImport: true,
      line: candidateDTO.line,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

    certificationCandidateErrors.push(...candidateBirthInformationValidation.certificationCandidateErrors);

    if (certificationCandidateErrors?.length > 0) {
      sessionsMassImportReport.addErrorReports(certificationCandidateErrors);
    } else {
      candidate.updateBirthInformation(candidateBirthInformationValidation.cpfBirthInformation);
    }

    const candidateEmailsErrors = await sessionsImportValidationService.validateCandidateEmails({
      candidate,
      line: candidateDTO.line,
    });

    sessionsMassImportReport.addErrorReports(candidateEmailsErrors);

    return candidate;
  });
}
