/**
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('./index.js').ScoringV2Service} ScoringV2Service
 * @typedef {import('./index.js').EvaluationSessionRepository} EvaluationSessionRepository
 * @typedef {import('./index.js').Services} Services
 */
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFinalizedSessionError } from '../../../../shared/domain/errors.js';
import CertificationCancelled from '../../../../shared/domain/events/CertificationCancelled.js';
import { CertificationCourseUnrejected } from '../../../../shared/domain/events/CertificationCourseUnrejected.js';
import CertificationUncancelled from '../../../../shared/domain/events/CertificationUncancelled.js';
import { checkEventTypes } from '../../../../shared/domain/events/check-event-types.js';
import { SessionAlreadyPublishedError } from '../../../session-management/domain/errors.js';
import { CertificationCourseRejected } from '../../../session-management/domain/events/CertificationCourseRejected.js';
import { CertificationJuryDone } from '../../../session-management/domain/events/CertificationJuryDone.js';
import * as injectedCertificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as injectedEvaluationSessionRepository from '../../infrastructure/repositories/session-repository.js';
import CertificationRescored from '../events/CertificationRescored.js';
import { services as injectedServices } from '../services/index.js';

const eventTypes = [
  CertificationJuryDone,
  CertificationCourseRejected,
  CertificationCourseUnrejected,
  CertificationCancelled,
  CertificationRescored,
  CertificationUncancelled,
];

export const rescoreV3Certification = withTransaction(
  /**
   * @param {Object} params
   * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
   * @param {EvaluationSessionRepository} params.evaluationSessionRepository
   * @param {Services} services
   *
   * @returns {Promise<void>}
   * @throws {Error} unrecognized event
   * @throws {NotFinalizedSessionError}
   * @throws {SessionAlreadyPublishedError}
   */
  async ({
    event,
    certificationAssessmentRepository = injectedCertificationAssessmentRepository,
    evaluationSessionRepository = injectedEvaluationSessionRepository,
    services = injectedServices,
  } = {}) => {
    checkEventTypes(event, eventTypes);

    const certificationCourseId = event.certificationCourseId;

    await _verifySessionIsPublishable({ certificationCourseId, evaluationSessionRepository });

    const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
      certificationCourseId,
    });

    if (certificationAssessment.isScoringBlockedDueToComplementaryOnlyChallenges) {
      return;
    }

    return _handleV3CertificationScoring({
      certificationAssessment,
      event,
      locale: event.locale,
      services,
    });
  },
);

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {EvaluationSessionRepository} params.evaluationSessionRepository
 *
 * @returns {Promise<void>}
 * @throws {NotFinalizedSessionError}
 * @throws {SessionAlreadyPublishedError}
 */
const _verifySessionIsPublishable = async ({ certificationCourseId, evaluationSessionRepository }) => {
  const session = await evaluationSessionRepository.getByCertificationCourseId({ certificationCourseId });

  if (!session.isFinalized) {
    throw new NotFinalizedSessionError();
  }

  if (session.isPublished) {
    throw new SessionAlreadyPublishedError();
  }
};

/**
 * @param {Object} params
 */
async function _handleV3CertificationScoring({ certificationAssessment, event, locale, services }) {
  const certificationCourse = await services.handleV3CertificationScoring({
    event,
    certificationAssessment,
    locale,
    dependencies: { findByCertificationCourseIdAndAssessmentId: services.findByCertificationCourseIdAndAssessmentId },
  });

  return services.scoreDoubleCertificationV3({ certificationCourseId: certificationCourse.getId() });
}
