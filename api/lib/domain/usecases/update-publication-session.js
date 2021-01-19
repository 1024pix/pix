const { InvalidParametersForSessionPublication } = require('../../domain/errors');
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
    await _sendPrescriberEmails(session);
    session = await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });
  }

  return session;
};

async function _sendPrescriberEmails(session) {
  const recipientEmails = uniqBy(session.certificationCandidates, 'resultRecipientEmail')
    .map((candidate) => candidate.resultRecipientEmail)
    .filter(Boolean);

  const promises = recipientEmails.map((recipientEmail) => {
    const link = `api/${recipientEmail}/${session.id}/results`;

    return mailService.sendCertificationResultEmail({
      email: recipientEmail,
      sessionId: session.id,
      sessionDate: session.date,
      certificationCenterName: session.certificationCenter,
      link,
    });
  });
  return Promise.all(promises);
}
