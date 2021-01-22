const { InvalidParametersForSessionPublication, SendingEmailToResultRecipientError } = require('../../domain/errors');
const mailService = require('../../domain/services/mail-service');
const uniqBy = require('lodash/uniqBy');

module.exports = async function updatePublicationSession({
  sessionId,
  toPublish,
  certificationRepository,
  sessionRepository,
  publishedAt = new Date(),
}) {
  const integerSessionId = parseInt(sessionId);

  if (!Number.isFinite(integerSessionId) || (typeof toPublish !== 'boolean')) {
    throw new InvalidParametersForSessionPublication();
  }

  let session = await sessionRepository.getWithCertificationCandidates(sessionId);

  await certificationRepository.updatePublicationStatusesBySessionId(sessionId, toPublish);

  if (toPublish) {
    await _sendPrescriberEmails(session, sessionRepository);
    session = await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });
  }

  return session;
};

async function _sendPrescriberEmails(session, sessionRepository) {
  const recipientEmails = uniqBy(session.certificationCandidates, 'resultRecipientEmail')
    .map((candidate) => candidate.resultRecipientEmail)
    .filter(Boolean);

  try {
    await Promise.all(recipientEmails.map((recipientEmail) => {
      return mailService.sendCertificationResultEmail({
        email: recipientEmail,
        sessionId: session.id,
        sessionDate: session.date,
        certificationCenterName: session.certificationCenter,
        resultRecipientEmail: recipientEmail,
        daysBeforeExpiration: 30,
      });
    }));

    if (recipientEmails.length > 0) {
      await sessionRepository.flagResultsAsSentToPrescriber({ id: session.id, resultsSentToPrescriberAt: new Date() });
    }

  } catch (error) {
    if (error) {
      throw new SendingEmailToResultRecipientError();
    }
  }

}
