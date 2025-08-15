import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedCertificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as injectedSharedSessionRepository from '../../../shared/infrastructure/repositories/session-repository.js';
import * as injectedFinalizedSessionRepository from '../../infrastructure/repositories/finalized-session-repository.js';
import { certificationRepository as injectedCertificationRepository } from '../../infrastructure/repositories/index.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';
import * as injectedSessionPublicationService from '../services/session-publication-service.js';

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
 * @param {SessionPublicationService} params.sessionPublicationService
 */
const publishSession = async function ({
  i18n,
  sessionId,
  publishedAt = new Date(),
  certificationRepository = injectedCertificationRepository,
  certificationCenterRepository = injectedCertificationCenterRepository,
  finalizedSessionRepository = injectedFinalizedSessionRepository,
  sharedSessionRepository = injectedSharedSessionRepository,
  sessionRepository = injectedSessionRepository,
  sessionPublicationService = injectedSessionPublicationService,
} = {}) {
  return DomainTransaction.execute(async function () {
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
    });

    return sessionRepository.get({ id: sessionId });
  });
};

export { publishSession };
