import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { SendingEmailToRefererError, SendingEmailToResultRecipientError } from '../errors.js';

export async function sendCleaSessionResultsToReferers({
  sessionId,
  certificationCenterRepository,
  sessionManagementRepository,
  mailService,
}) {
  const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });
  if (!hasSomeCleaAcquired) {
    logger.debug(`No CLEA certifications in session ${sessionId}`);
    return;
  }

  const session = await sessionManagementRepository.get({ id: sessionId });
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

  if (_someHaveFailed(refererEmailingAttempts)) {
    const failedEmailsReferer = _failedAttemptsEmail(refererEmailingAttempts);
    throw new SendingEmailToRefererError(failedEmailsReferer);
  }
}

export async function sendSessionResultsToPrescribers({
  sessionId,
  certificationRepository,
  sessionManagementRepository,
  mailService,
}) {
  const session = await sessionManagementRepository.get({ id: sessionId });

  const startedCertificationCoursesUserIds = (await certificationRepository.getStatusesBySessionId(sessionId)).map(
    ({ userId }) => userId,
  );

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

  if (_someHaveSucceeded(emailingAttempts) && _noneHaveFailed(emailingAttempts)) {
    await sessionManagementRepository.flagResultsAsSentToPrescriber({
      id: session.id,
      resultsSentToPrescriberAt: session.publishedAt,
    });
  }

  if (_someHaveFailed(emailingAttempts)) {
    const failedEmailsRecipients = _failedAttemptsEmail(emailingAttempts);
    throw new SendingEmailToResultRecipientError(failedEmailsRecipients);
  }
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
