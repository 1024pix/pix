/**
 * @typedef {import ('../../../lib/domain/usecases/index.js').CertificationRepository} CertificationRepository
 * @typedef {import ('../../../lib/domain/usecases/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import ('../../../lib/domain/usecases/index.js').SharedSessionRepository} SharedSessionRepository
 * @typedef {import ('../../../lib/domain/usecases/index.js').SessionRepository} SessionRepository
 * @typedef {import ('../../../lib/domain/usecases/index.js').MailService} MailService
 * @typedef {import ('../../../lib/domain/usecases/index.js').SessionPublicationService} SessionPublicationService
 */

/**
 * @param {Object} params
 * @param {CertificationRepository} params.certificationRepository
 * @param {certificationCenterRepository} params.certificationCenterRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {SharedSessionRepository} params.sharedSessionRepository
 * @param {SessionPublicationService} params.sessionPublicationService
 */
const publishSession = async function ({
  i18n,
  sessionId,
  publishedAt = new Date(),
  certificationRepository,
  certificationCenterRepository,
  finalizedSessionRepository,
  sharedSessionRepository,
  sessionRepository,
  sessionPublicationService,
}) {
  const session = await sessionPublicationService.publishSession({
    sessionId,
    publishedAt,
    certificationRepository,
    finalizedSessionRepository,
    sessionRepository,
    sharedSessionRepository,
  });

  await sessionPublicationService.manageEmails({
    i18n,
    session,
    publishedAt,
    certificationCenterRepository,
    sessionRepository,
    sharedSessionRepository,
  });

  return sessionRepository.get({ id: sessionId });
};

export { publishSession };
