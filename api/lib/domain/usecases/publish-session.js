/**
 * @typedef {import ('../../../lib/domain/usecases/index.js').CertificationRepository} CertificationRepository
 * @typedef {import ('../../../lib/domain/usecases/index.js').FinalizedSessionRepository} FinalizedSessionRepository
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
 * @param {SessionPublicationService} params.sessionPublicationService
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
