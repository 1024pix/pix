const { InvalidParametersForSessionPublication } = require('../../domain/errors');
const mailService = require('../../domain/services/mail-service');

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

  let session = await sessionRepository.get(sessionId);

  await certificationRepository.updatePublicationStatusesBySessionId(sessionId, toPublish);

  if (toPublish) {

    await mailService.sendCertificationResultEmail({
      email: process.env.TEMP_EMAIL,
      sessionId,
      sessionDate: session.date,
      certificationCenterName: session.certificationCenter,
      link: 'toto/pix.fr',
    });
    session = await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt });
  }

  return session;
};
