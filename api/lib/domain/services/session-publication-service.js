/**
 * @typedef {import ('../../../lib/domain/usecases/index.js').dependencies} deps
 */
import {
  SendingEmailToResultRecipientError,
  SessionAlreadyPublishedError,
  SendingEmailToRefererError,
} from '../../domain/errors.js';
import * as mailService from '../../domain/services/mail-service.js';
import lodash from 'lodash';

const { some, uniqBy } = lodash;

import { logger } from '../../infrastructure/logger.js';

/**
 * @param {Object} params
 * @param {deps['certificationRepository']} params.certificationRepository
 * @param {deps['finalizedSessionRepository']} params.finalizedSessionRepository
 * @param {deps['sessionRepository']} params.sessionRepository
 */
async function publishSession({
  publishedAt = new Date(),
  sessionId,
  certificationRepository,
  finalizedSessionRepository,
  sessionRepository,
}) {
  const session = await sessionRepository.getWithCertificationCandidates(sessionId);
  if (session.isPublished()) {
    throw new SessionAlreadyPublishedError();
  }

  await certificationRepository.publishCertificationCoursesBySessionId(sessionId);

  await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });

  await _updateFinalizedSession(finalizedSessionRepository, sessionId, publishedAt);

  return session;
}

/**
 * @param {Object} params
 * @param {deps['certificationCenterRepository']} params.certificationCenterRepository
 * @param {deps['sessionRepository']} params.sessionRepository
 * @param {Object} params.dependencies
 * @param {deps['mailService']} params.dependencies.mailService
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
 * @param {deps['certificationCenterRepository']} params.certificationCenterRepository
 * @param {deps['sessionRepository']} params.sessionRepository
 * @param {deps['mailService']} params.mailService
 */
async function _manageCleaEmails({ session, certificationCenterRepository, sessionRepository, mailService }) {
  const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(session.id);
  if (!hasSomeCleaAcquired) {
    logger.debug(`No CLEA certifications in session ${session.id}`);
    return;
  }

  const refererEmails = await certificationCenterRepository.getRefererEmails(session.certificationCenterId);
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
 * @param {deps['mailService']} params.mailService
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
  await finalizedSessionRepository.save(finalizedSession);
}

export { publishSession, manageEmails };
