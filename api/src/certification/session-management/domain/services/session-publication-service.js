/**
 * @typedef {import('../../../../../src/certification/session-management/domain/usecases/index.js').CertificationRepository} CertificationRepository
 * @typedef {import('../../../../../src/certification/session-management/domain/usecases/index.js').MailService} MailService
 */
import lodash from 'lodash';

import { mailService } from '../../../../../src/certification/session-management/domain/services/mail-service.js';
import {
  CertificationCourseNotPublishableError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
  SessionWithPixPlusNotPublishableError,
} from '../errors.js';
import { SessionAlreadyPublishedError } from '../errors.js';

const { some, uniqBy } = lodash;

import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

/**
 * @param {Object} params
 * @param {CertificationRepository} params.certificationRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {SharedSessionRepository} params.sharedSessionRepository
 * @param {PixPlusCertificationRepository} params.pixPlusCertificationRepository
 */
async function publishSession({
  publishedAt = new Date(),
  sessionId,
  certificationRepository,
  finalizedSessionRepository,
  sessionRepository,
  sharedSessionRepository,
  pixPlusCertificationRepository,
}) {
  const session = await sharedSessionRepository.getWithCertificationCandidates({ id: sessionId });

  if (session.isPublished()) {
    throw new SessionAlreadyPublishedError();
  }

  if (_hasComplementaryCertification(session)) {
    const pixPlusCertificationCourses = await pixPlusCertificationRepository.getBySessionId(session.id);

    if (pixPlusCertificationCourses.length > 0) {
      throw new SessionWithPixPlusNotPublishableError(sessionId);
    }
  }

  const certificationStatuses = await certificationRepository.getStatusesBySessionId(sessionId);

  if (_isAnyCertificationNotPublishable(certificationStatuses)) {
    throw new CertificationCourseNotPublishableError(sessionId);
  }

  await certificationRepository.publishCertificationCourses(certificationStatuses);

  await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });

  await _updateFinalizedSession(finalizedSessionRepository, sessionId, publishedAt);

  const startedCertificationCoursesUserIds = certificationStatuses.map(({ userId }) => userId);

  return { session, startedCertificationCoursesUserIds };
}

/**
 * @param {Object} params
 * @param {certificationCenterRepository} params.certificationCenterRepository
 * @param {sessionRepository} params.sessionRepository
 * @param {Array<number>} params.startedCertificationCoursesUserIds
 * @param {Object} params.dependencies
 * @param {mailService} params.dependencies.mailService
 */
async function manageEmails({
  session,
  publishedAt,
  certificationCenterRepository,
  sessionRepository,
  startedCertificationCoursesUserIds,
  dependencies = { mailService },
}) {
  const cleaEmailingAttempts = await _manageCleaEmails({
    session,
    sessionRepository,
    certificationCenterRepository,
    mailService: dependencies.mailService,
  });

  const prescribersEmailingAttempts = await _managePrescriberEmails({
    session,
    startedCertificationCoursesUserIds,
    mailService: dependencies.mailService,
  });

  if (_someHaveSucceeded(prescribersEmailingAttempts) && _noneHaveFailed(prescribersEmailingAttempts)) {
    await sessionRepository.flagResultsAsSentToPrescriber({
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
 * @param {Object} params
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {MailService} params.mailService
 */
async function _manageCleaEmails({ session, certificationCenterRepository, sessionRepository, mailService }) {
  const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired({ id: session.id });
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
 * @param {Object} params
 * @param {Array<number>} params.startedCertificationCoursesUserIds
 * @param {MailService} params.mailService
 * @return {Object}
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

  return uniqBy(candidatesWithStartedCertificationCourse, (candidate) => candidate.resultRecipientEmail?.toLowerCase())
    .map((candidate) => candidate.resultRecipientEmail)
    .filter(Boolean);
}

function _someHaveSucceeded(emailingAttempts) {
  return some(emailingAttempts, (emailAttempt) => emailAttempt.hasSucceeded());
}

function _noneHaveFailed(emailingAttempts) {
  return !some(emailingAttempts, (emailAttempt) => emailAttempt.hasFailed());
}

function _someHaveFailed(emailingAttempts) {
  return some(emailingAttempts, (emailAttempt) => emailAttempt.hasFailed());
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

function _hasComplementaryCertification(session) {
  return session.certificationCandidates.some((candidate) => Boolean(candidate.complementaryCertification));
}

export { manageEmails, publishSession };
