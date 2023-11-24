/**
 * @typedef {import ('../../../lib/domain/usecases/index.js').dependencies} deps
 */

/**
 * @param {Object} params
 * @param {deps['certificationRepository']} params.certificationRepository
 * @param {deps['certificationCenterRepository']} params.certificationCenterRepository
 * @param {deps['finalizedSessionRepository']} params.finalizedSessionRepository
 * @param {deps['sessionRepository']} params.sessionRepository
 * @param {deps['sessionPublicationService']} params.sessionPublicationService
 */
const publishSession = async function ({
  i18n,
  sessionId,
  publishedAt = new Date(),
  certificationRepository,
  certificationCenterRepository,
  finalizedSessionRepository,
  sessionRepository,
  sessionPublicationService,
}) {
  const session = await sessionPublicationService.publishSession({
    sessionId,
    publishedAt,
    certificationRepository,
    finalizedSessionRepository,
    sessionRepository,
  });

  await sessionPublicationService.manageEmails({
    i18n,
    session,
    publishedAt,
    certificationCenterRepository,
    sessionRepository,
  });

  return sessionRepository.get(sessionId);
};

export { publishSession };
