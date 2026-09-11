import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @typedef {import ('../../../../../src/certification/session-management/domain/usecases/index.js').CertificationRepository} CertificationRepository
 */

/**
 * @param {object} params
 * @param {CertificationRepository} params.certificationRepository
 * @param {certificationCenterRepository} params.certificationCenterRepository
 * @param {FinalizedSessionRepository} params.finalizedSessionRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 * @param {SharedSessionRepository} params.sharedSessionRepository
 * @param {SessionPublicationService} params.sessionPublicationService
 */
export async function publishSession({
  sessionId,
  publishedAt = new Date(),
  certificationRepository,
  certificationCenterRepository,
  finalizedSessionRepository,
  sharedSessionRepository,
  sessionManagementRepository,
  sessionPublicationService,
}) {
  return DomainTransaction.execute(async function () {
    const { session, startedCertificationCoursesUserIds } = await sessionPublicationService.publishSession({
      sessionId,
      publishedAt,
      certificationRepository,
      finalizedSessionRepository,
      sessionManagementRepository,
      sharedSessionRepository,
    });

    await sessionPublicationService.manageEmails({
      session,
      startedCertificationCoursesUserIds,
      publishedAt,
      certificationCenterRepository,
      sessionManagementRepository,
    });

    return sessionManagementRepository.get({ id: sessionId });
  });
}
