/**
 * @typedef {import('../../../../../src/certification/session-management/domain/usecases/index.js').CertificationRepository} CertificationRepository
 * @typedef {import('../../../../../src/certification/session-management/domain/usecases/index.js').MailService} MailService
 * @typedef {import('../../../../../src/certification/session-management/domain/usecases/index.js').SessionManagementRepository} SessionManagementRepository
 */
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import {
  CertificationCourseNotPublishableError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
  SessionAlreadyPublishedError,
} from '../errors.js';
import { mailService } from './mail-service.js';

/**
 * @param {object} params
 * @param {CertificationRepository} params.certificationRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 */
async function publishSession({
  publishedAt = new Date(),
  sessionId,
  certificationRepository,
  finalizedSessionRepository,
  sessionManagementRepository,
}) {
  const session = await sessionManagementRepository.get({ id: sessionId });
  if (session.isPublished()) {
    throw new SessionAlreadyPublishedError();
  }

  const certificationStatuses = await certificationRepository.getStatusesBySessionId(sessionId);

  if (_isAnyCertificationNotPublishable(certificationStatuses)) {
    throw new CertificationCourseNotPublishableError(sessionId);
  }

  await certificationRepository.publishCertificationCourses(certificationStatuses);

  await sessionManagementRepository.updatePublishedAt({ id: sessionId, publishedAt });

  await _updateFinalizedSession(finalizedSessionRepository, sessionId, publishedAt);

  const startedCertificationCoursesUserIds = certificationStatuses.map(({ userId }) => userId);

  return { session, startedCertificationCoursesUserIds };
}

/**
 * @param {object} params
 * @param {certificationCenterRepository} params.certificationCenterRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 * @param {Array<number>} params.startedCertificationCoursesUserIds
 * @param {object} params.dependencies
 * @param {mailService} params.dependencies.mailService
 */
async function manageEmails({
  session,
  publishedAt,
  certificationCenterRepository,
  sessionManagementRepository,
  startedCertificationCoursesUserIds,
  dependencies = { mailService },
}) {
  const cleaEmailingAttempts = await _manageCleaEmails({
    session,
    sessionManagementRepository,
    certificationCenterRepository,
    mailService: dependencies.mailService,
  });

  const prescribersEmailingAttempts = await _managePrescriberEmails({
    session,
    startedCertificationCoursesUserIds,
    mailService: dependencies.mailService,
  });

  if (_someHaveSucceeded(prescribersEmailingAttempts) && _noneHaveFailed(prescribersEmailingAttempts)) {
    await sessionManagementRepository.flagResultsAsSentToPrescriber({
      id: session.id,
      resultsSentToPrescriberAt: publishedAt,
    });
  }

  if (_someHaveFailed(cleaEmailingAttempts)) {
    const failedEmailsReferer = _failedAttemptsEmail(cleaEmailingAttempts);
    throw new SendingEmailToRefererError(failedEmailsReferer);
  }

  if (_someHaveFailed(prescribersEmailingAttempts)) {
    const failedEmailsRecipients = _failedAttemptsEmail(prescribersEmailingAttempts);
    throw new SendingEmailToResultRecipientError(failedEmailsRecipients);
  }
}

/**
 * @param {object} params
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 * @param {MailService} params.mailService
 */
async function _manageCleaEmails({ session, certificationCenterRepository, sessionManagementRepository, mailService }) {
  const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: session.id });
  if (!hasSomeCleaAcquired) {
    logger.debug(`No CLEA certifications in session ${session.id}`);
    return;
  }

  const refererEmails = await certificationCenterRepository.getRefererEmails({ id: session.certificationCenterId });
  if (refererEmails.length <= 0) {
    logger.warn(`Publishing session ${session.id} with Clea certifications but no referer. No email will be sent`);
    return;
  }

  const refererEmailingAttempts = [];
  for (const refererEmail of refererEmails) {
    const refererEmailingAttempt = await mailService.sendNotificationToCertificationCenterRefererForCleaResults({
      sessionId: session.id,
      email: refererEmail.email,
      sessionDate: session.date,
    });
    refererEmailingAttempts.push(refererEmailingAttempt);
  }

  return refererEmailingAttempts;
}

/**
 * @param {object} params
 * @param {Array<number>} params.startedCertificationCoursesUserIds
 * @param {MailService} params.mailService
 * @return {object}
 */
async function _managePrescriberEmails({ session, startedCertificationCoursesUserIds, mailService }) {
  const recipientEmails = _distinctCandidatesResultRecipientEmails(
    session.certificationCandidates,
    startedCertificationCoursesUserIds,
  );

  const emailingAttempts = [];
  for (const recipientEmail of recipientEmails) {
    const emailingAttempt = await mailService.sendCertificationResultEmail({
      email: recipientEmail,
      sessionId: session.id,
      sessionDate: session.date,
      certificationCenterName: session.certificationCenter,
      resultRecipientEmail: recipientEmail,
      daysBeforeExpiration: 30,
    });
    emailingAttempts.push(emailingAttempt);
  }
  return emailingAttempts;
}

function _distinctCandidatesResultRecipientEmails(certificationCandidates, startedCertificationCoursesUserIds) {
  const userIdsSet = new Set(startedCertificationCoursesUserIds);
  const candidatesWithStartedCertificationCourse = certificationCandidates.filter((candidate) =>
    userIdsSet.has(candidate.userId),
  );
  const recipientEmails = candidatesWithStartedCertificationCourse
    .map((candidate) => candidate.resultRecipientEmail?.toLowerCase())
    .filter(Boolean);
  return [...new Set(recipientEmails)];
}

function _someHaveSucceeded(emailingAttempts) {
  return emailingAttempts?.some((emailAttempt) => emailAttempt.hasSucceeded());
}

function _noneHaveFailed(emailingAttempts) {
  return !emailingAttempts?.some((emailAttempt) => emailAttempt.hasFailed());
}

function _someHaveFailed(emailingAttempts) {
  return emailingAttempts?.some((emailAttempt) => emailAttempt.hasFailed());
}

function _failedAttemptsEmail(emailingAttempts) {
  return emailingAttempts.filter((emailAttempt) => emailAttempt.hasFailed()).map((emailAttempt) => emailAttempt.email);
}

async function _updateFinalizedSession(finalizedSessionRepository, sessionId, publishedAt) {
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });
  finalizedSession.publish(publishedAt);
  await finalizedSessionRepository.save({ finalizedSession });
}

function _isAnyCertificationNotPublishable(certificationStatuses) {
  const hasCertificationInError = _hasCertificationInError(certificationStatuses);
  const hasCertificationWithNoAssessmentResultStatus = _hasCertificationWithNoScoring(certificationStatuses);
  return hasCertificationInError || hasCertificationWithNoAssessmentResultStatus;
}

function _hasCertificationInError(certificationStatus) {
  return certificationStatus.some(
    ({ pixCertificationStatus }) => pixCertificationStatus === AssessmentResult.status.ERROR,
  );
}

function _hasCertificationWithNoScoring(certificationStatuses) {
  return certificationStatuses.some(({ pixCertificationStatus }) => pixCertificationStatus === null);
}

export { manageEmails, publishSession };
