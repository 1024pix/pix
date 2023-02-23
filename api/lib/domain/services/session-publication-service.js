const { SendingEmailToResultRecipientError, SessionAlreadyPublishedError } = require('../../domain/errors.js');
const mailService = require('../../domain/services/mail-service.js');
const uniqBy = require('lodash/uniqBy');
const some = require('lodash/some');
const { SendingEmailToRefererError } = require('../errors.js');
const logger = require('../../infrastructure/logger.js');

async function publishSession({
  publishedAt = new Date(),
  sessionId,
  certificationCenterRepository,
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

  const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(session.id);

  if (hasSomeCleaAcquired) {
    const refererEmails = await certificationCenterRepository.getRefererEmails(session.certificationCenterId);
    if (!refererEmails.length) {
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

    if (_someHaveFailed(refererEmailingAttempts)) {
      const failedEmailsReferer = _failedAttemptsEmail(refererEmailingAttempts);
      throw new SendingEmailToRefererError(failedEmailsReferer);
    }
  }

  const emailingAttempts = await _sendPrescriberEmails(session);
  if (_someHaveSucceeded(emailingAttempts) && _noneHaveFailed(emailingAttempts)) {
    await sessionRepository.flagResultsAsSentToPrescriber({
      id: sessionId,
      resultsSentToPrescriberAt: publishedAt,
    });
  }
  if (_someHaveFailed(emailingAttempts)) {
    const failedEmailsRecipients = _failedAttemptsEmail(emailingAttempts);
    throw new SendingEmailToResultRecipientError(failedEmailsRecipients);
  }
}

async function _sendPrescriberEmails(session) {
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

module.exports = {
  publishSession,
};
