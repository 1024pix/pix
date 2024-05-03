/**
 * @typedef {import('../../../lib/domain/usecases/index.js').CertificationRepository} CertificationRepository
 * @typedef {import('../../../lib/domain/usecases/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import('../../../lib/domain/usecases/index.js').SessionRepository} SessionRepository
 * @typedef {import('../../../lib/domain/usecases/index.js').MailService} MailService
 */
import lodash from 'lodash';

import { SessionAlreadyPublishedError } from '../../../src/certification/session-management/domain/errors.js';
import {
  CertificationCourseNotPublishableError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
} from '../../domain/errors.js';
import * as mailService from '../../domain/services/mail-service.js';

const { some, uniqBy } = lodash;

import { status } from '../../../src/shared/domain/models/AssessmentResult.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';

/**
 * @param {Object} params
 * @param {CertificationRepository} params.certificationRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 * @param {SessionRepository} params.sessionRepository
 */
async function publishSession({
  publishedAt = new Date(),
  sessionId,
  certificationRepository,
  finalizedSessionRepository,
  sessionRepository,
}) {
  const session = await sessionRepository.getWithCertificationCandidates({ id: sessionId });
  if (session.isPublished()) {
    throw new SessionAlreadyPublishedError();
  }

  const certificationStatuses = await certificationRepository.getStatusesBySessionId(sessionId);

  const hasCertificationInError = _hasCertificationInError(certificationStatuses);
  const hasCertificationWithNoAssessmentResultStatus = _hasCertificationWithNoScoring(certificationStatuses);
  if (hasCertificationInError || hasCertificationWithNoAssessmentResultStatus) {
    throw new CertificationCourseNotPublishableError(sessionId);
  }

  await certificationRepository.publishCertificationCourses(certificationStatuses);

  await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });

  await _updateFinalizedSession(finalizedSessionRepository, sessionId, publishedAt);

  return session;
}

/**
 * @param {Object} params
 * @param {certificationCenterRepository} params.certificationCenterRepository
 * @param {sessionRepository} params.sessionRepository
 * @param {Object} params.dependencies
 * @param {mailService} params.dependencies.mailService
 */
async function manageEmails({
  i18n,
  session,
  publishedAt,
  certificationCenterRepository,
  sessionRepository,
  dependencies = { mailService },
}) {
  const cleaEmailingAttempts = await _manageCleaEmails({
    session,
    sessionRepository,
    certificationCenterRepository,
    mailService: dependencies.mailService,
    i18n,
  });

  const prescribersEmailingAttempts = await _managerPrescriberEmails({
    session,
    mailService: dependencies.mailService,
    i18n,
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
 * @param {MailService} params.mailService
 */
async function _managerPrescriberEmails({ session, mailService, i18n }) {
  const recipientEmails = _distinctCandidatesResultRecipientEmails(session.certificationCandidates);

  const emailingAttempts = [];
  for (const recipientEmail of recipientEmails) {
    const emailingAttempt = await mailService.sendCertificationResultEmail({
      email: recipientEmail,
      sessionId: session.id,
      sessionDate: session.date,
      certificationCenterName: session.certificationCenter,
      resultRecipientEmail: recipientEmail,
      daysBeforeExpiration: 30,
      translate: i18n.__,
    });
    emailingAttempts.push(emailingAttempt);
  }
  return emailingAttempts;
}

function _distinctCandidatesResultRecipientEmails(certificationCandidates) {
  return uniqBy(certificationCandidates, 'resultRecipientEmail')
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

function _hasCertificationInError(certificationStatus) {
  return certificationStatus.some(
    ({ pixCertificationStatus, isCancelled }) => pixCertificationStatus === status.ERROR && !isCancelled,
  );
}

function _hasCertificationWithNoScoring(certificationStatuses) {
  return certificationStatuses.some(
    ({ pixCertificationStatus, isCancelled }) => pixCertificationStatus === null && !isCancelled,
  );
}

export { manageEmails, publishSession };
