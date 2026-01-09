/**
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('./index.js').ScoringV2Service} ScoringV2Service
 * @typedef {import('./index.js').EvaluationSessionRepository} EvaluationSessionRepository
 * @typedef {import('./index.js').Services} Services
 * @typedef {import('../../../shared/domain/events/CertificationRescored.js').CertificationRescored} CertificationRescoredEvent
 * @typedef {import('../../session-management/domain/models/CertificationAssessment.js').CertificationAssessment} CertificationAssessment
 * @typedef {import('../services/scoring/scoring-v3-old.js').HandleV3CertificationScoringService} HandleV3CertificationScoringService
 * @typedef {import('../services/scoring/calibrated-challenge-service.js').FindByCertificationCourseAndVersionService} FindByCertificationCourseAndVersionService
 * @typedef {import('../services/scoring/scoring-v3-old.js').ScoreDoubleCertificationV3Service} ScoreDoubleCertificationV3Service
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
import CertificationRescored from '../events/CertificationRescored.js';

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
   * @param {object} params
   * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
   * @param {EvaluationSessionRepository} params.evaluationSessionRepository
   * @param {Services} services
   *
   * @returns {Promise<void>}
   * @throws {Error} unrecognized event
   * @throws {NotFinalizedSessionError}
   * @throws {SessionAlreadyPublishedError}
   */
  async ({ event, certificationAssessmentRepository, evaluationSessionRepository, services }) => {
    checkEventTypes(event, eventTypes);

    const certificationCourseId = event.certificationCourseId;

    await _verifySessionIsPublishable({ certificationCourseId, evaluationSessionRepository });

    const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
      certificationCourseId,
    });

    return _handleV3CertificationScoring({
      certificationAssessment,
      event,
      locale: event.locale,
      services,
    });
  },
);

/**
 * @param {object} params
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
 * @param {object} params
 * @param {CertificationAssessment} params.certificationAssessment
 * @param {CertificationRescoredEvent} params.event
 * @param {string} params.locale
 * @param {object} params.services
 * @param {HandleV3CertificationScoringService} params.services.handleV3CertificationScoring
 * @param {FindByCertificationCourseAndVersionService} params.services.findByCertificationCourseAndVersionService
 * @param {ScoreDoubleCertificationV3Service} params.services.scoreDoubleCertificationV3
 * @returns {Promise<void>}
 */
async function _handleV3CertificationScoring({ certificationAssessment, event, locale, services }) {
  const certificationCourse = await services.handleV3CertificationScoring({
    event,
    certificationAssessment,
    locale,
    dependencies: { findByCertificationCourseAndVersion: services.findByCertificationCourseAndVersion },
  });

  return services.scoreDoubleCertificationV3({ certificationCourseId: certificationCourse.getId() });
}
