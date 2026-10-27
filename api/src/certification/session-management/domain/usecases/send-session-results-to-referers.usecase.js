import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { SendingEmailToRefererError, SendingEmailToResultRecipientError } from '../errors.js';

export async function sendCleaSessionResultsToReferers({
  sessionId,
  sessionManagementRepository,
  resultRecipientInfoRepository,
  mailService,
}) {
  const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });
  if (!hasSomeCleaAcquired) {
    logger.debug(`No CLEA certifications in session ${sessionId}`);
    return;
  }

  const resultRecipientInfo = await resultRecipientInfoRepository.findBySessionId({ sessionId });
  if (resultRecipientInfo.uniqueEmailsForClea.length === 0) {
    logger.warn(`Publishing session ${sessionId} with Clea certifications but no referer. No email will be sent`);
    return;
  }

  const refererEmailingAttempts = [];
  for (const refererEmail of resultRecipientInfo.uniqueEmailsForClea) {
    const refererEmailingAttempt = await mailService.sendNotificationToCertificationCenterRefererForCleaResults({
      sessionId: sessionId,
      email: refererEmail.email,
      sessionDate: resultRecipientInfo.sessionDate,
    });
    refererEmailingAttempts.push(refererEmailingAttempt);
  }

  if (_someHaveFailed(refererEmailingAttempts)) {
    const failedEmailsReferer = _failedAttemptsEmail(refererEmailingAttempts);
    throw new SendingEmailToRefererError(failedEmailsReferer);
  }
}

export async function sendSessionResultsToPrescribers({
  sessionId,
  sessionManagementRepository,
  resultRecipientInfoRepository,
  mailService,
}) {
  const session = await sessionManagementRepository.get({ id: sessionId });
  const resultRecipientInfo = await resultRecipientInfoRepository.findBySessionId({ sessionId });
  const emailingAttempts = [];
  for (const recipientEmail of resultRecipientInfo.uniqueEmails) {
    const emailingAttempt = await mailService.sendCertificationResultEmail({
      email: recipientEmail,
      sessionId: session.id,
      sessionDate: resultRecipientInfo.sessionDate,
      certificationCenterName: resultRecipientInfo.certificationCenter,
      resultRecipientEmail: recipientEmail,
      daysBeforeExpiration: 30,
    });
    emailingAttempts.push(emailingAttempt);
  }

  if (_someHaveSucceeded(emailingAttempts) && _noneHaveFailed(emailingAttempts)) {
    session.resultsSentToPrescriberAt = session.publishedAt;
    await sessionManagementRepository.update(session);
  }

  if (_someHaveFailed(emailingAttempts)) {
    const failedEmailsRecipients = _failedAttemptsEmail(emailingAttempts);
    throw new SendingEmailToResultRecipientError(failedEmailsRecipients);
  }
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
  const failedEmailAttempts = emailingAttempts.filter((emailAttempt) => emailAttempt.hasFailed());
  return failedEmailAttempts.map((emailAttempt) => {
    return { email: emailAttempt.email, code: emailAttempt.errorCode, message: emailAttempt.errorMessage };
  });
}
