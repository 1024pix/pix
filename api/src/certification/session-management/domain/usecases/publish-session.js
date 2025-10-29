import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @typedef {import ('../../../../../src/certification/session-management/domain/usecases/index.js').CertificationRepository} CertificationRepository
 */

/**
 * @param {Object} params
 * @param {CertificationRepository} params.certificationRepository
 * @param {certificationCenterRepository} params.certificationCenterRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {SharedSessionRepository} params.sharedSessionRepository
 * @param {PixPlusCertificationRepository} params.pixPlusCertificationRepository
 * @param {SessionPublicationService} params.sessionPublicationService
 */
const publishSession = async function ({
  sessionId,
  publishedAt = new Date(),
  certificationRepository,
  certificationCenterRepository,
  finalizedSessionRepository,
  sharedSessionRepository,
  sessionRepository,
  sessionPublicationService,
  pixPlusCertificationRepository,
}) {
  return DomainTransaction.execute(async function () {
    const { session, startedCertificationCoursesUserIds } = await sessionPublicationService.publishSession({
      sessionId,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sessionRepository,
      sharedSessionRepository,
      pixPlusCertificationRepository,
    });

    await sessionPublicationService.manageEmails({
      session,
      startedCertificationCoursesUserIds,
      publishedAt,
      certificationCenterRepository,
      sessionRepository,
    });

    return sessionRepository.get({ id: sessionId });
  });
};

export { publishSession };
