const { SendingEmailToResultRecipientError } = require('../../domain/errors');
const mailService = require('../../domain/services/mail-service');
const uniqBy = require('lodash/uniqBy');
const some = require('lodash/some');

module.exports = async function publishSession({
  sessionId,
  certificationRepository,
  finalizedSessionRepository,
  sessionRepository,
  publishedAt = new Date(),
}) {
  const session = await sessionRepository.getWithCertificationCandidates(sessionId);

  await certificationRepository.publishCertificationCoursesBySessionId(sessionId);

  let publishedSession = await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });

  await finalizedSessionRepository.updatePublishedAt(sessionId);

  const emailingAttempts = await _sendPrescriberEmails(session);
  if (_someHaveSucceeded(emailingAttempts) && _noneHaveFailed(emailingAttempts)) {
    publishedSession = await sessionRepository.flagResultsAsSentToPrescriber({
      id: session.id,
      resultsSentToPrescriberAt: publishedAt,
    });
  }
  if (_someHaveFailed(emailingAttempts)) {
    const failedEmailsRecipients = _failedAttemptsRecipients(emailingAttempts);
    throw new SendingEmailToResultRecipientError(failedEmailsRecipients);
  }

  return publishedSession;
};

async function _sendPrescriberEmails(session) {
  const recipientEmails = _distinctCandidatesResultRecipientEmails(session.certificationCandidates);

  const emailingAttempts = [];
  for (const recipientEmail of recipientEmails) {
    try {
      await mailService.sendCertificationResultEmail({
        email: recipientEmail,
        sessionId: session.id,
        sessionDate: session.date,
        certificationCenterName: session.certificationCenter,
        resultRecipientEmail: recipientEmail,
        daysBeforeExpiration: 30,
      });
      emailingAttempts.push(EmailingAttempt.success(recipientEmail));
    } catch (error) {
      emailingAttempts.push(EmailingAttempt.failure(recipientEmail));
    }
  }
  return emailingAttempts;
}

function _distinctCandidatesResultRecipientEmails(certificationCandidates) {
  return uniqBy(certificationCandidates, 'resultRecipientEmail')
    .map((candidate) => candidate.resultRecipientEmail)
    .filter(Boolean);
}

class EmailingAttempt {
  constructor(recipientEmail, status) {
    this.recipientEmail = recipientEmail;
    this.status = status;
  }

  hasFailed() {
    return this.status === AttemptStatus.FAILURE;
  }

  hasSucceeded() {
    return this.status === AttemptStatus.SUCCESS;
  }

  static success(recipientEmail) {
    return new EmailingAttempt(recipientEmail, AttemptStatus.SUCCESS);
  }

  static failure(recipientEmail) {
    return new EmailingAttempt(recipientEmail, AttemptStatus.FAILURE);
  }
}

const AttemptStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

function _someHaveSucceeded(emailingAttempts) {
  return some(emailingAttempts, (emailAttempt) => emailAttempt.hasSucceeded());
}

function _noneHaveFailed(emailingAttempts) {
  return !some(emailingAttempts, (emailAttempt) => emailAttempt.hasFailed());
}

function _someHaveFailed(emailingAttempts) {
  return some(emailingAttempts, (emailAttempt) => emailAttempt.hasFailed());
}

function _failedAttemptsRecipients(emailingAttempts) {
  return emailingAttempts.filter((emailAttempt) => emailAttempt.hasFailed())
    .map((emailAttempt) => emailAttempt.recipient);
}
