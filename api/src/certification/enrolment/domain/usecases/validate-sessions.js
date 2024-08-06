/**
 * @typedef {import ("./index.js").dependencies} deps
 */

import bluebird from 'bluebird';

import { Candidate } from '../models/Candidate.js';
import { SessionEnrolment } from '../models/SessionEnrolment.js';
import { SessionMassImportReport } from '../models/SessionMassImportReport.js';

/**
 * @param {Object} params
 * @param {deps["certificationCenterRepository"]} params.certificationCenterRepository
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
  certificationCenterRepository,
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
  const { name: certificationCenter, isSco } = await certificationCenterRepository.get({ id: certificationCenterId });
  const sessionsMassImportReport = new SessionMassImportReport();
  const translate = i18n.__;

  const validatedSessions = await bluebird.mapSeries(sessionsData, async (sessionDTO) => {
    const { sessionId } = sessionDTO;

    const accessCode = sessionCodeService.getNewSessionCode();
    const session = new SessionEnrolment({
      ...sessionDTO,
      certificationCandidates: [],
      id: sessionId,
      certificationCenterId,
      certificationCenter,
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
        isSco,
        sessionsMassImportReport,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        complementaryCertificationRepository,
        translate,
        sessionsImportValidationService,
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
}) {
  const { uniqueCandidates, duplicateCandidateErrors } =
    sessionsImportValidationService.getUniqueCandidates(candidatesDTO);
  if (duplicateCandidateErrors.length > 0) {
    sessionsMassImportReport.addErrorReports(duplicateCandidateErrors);
  }

  return bluebird.mapSeries(uniqueCandidates, async (candidateDTO) => {
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
      });

    certificationCandidateErrors.push(...certificationCandidateComplementaryErrors);

    const candidate = new Candidate({
      ...candidateDTO,
      sessionId,
      billingMode: billingMode || candidateDTO.billingMode,
      subscriptions,
      id: null,
      userId: null,
      organizationLearnerId: null,
      createdAt: null,
    });

    const candidateBirthInformationValidation =
      await sessionsImportValidationService.getValidatedCandidateBirthInformation({
        candidate: candidate,
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
