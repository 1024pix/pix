/**
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('./index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('./index.js').ScoringV2Service} ScoringV2Service
 * @typedef {import('./index.js').ComplementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {import('./index.js').EvaluationSessionRepository} EvaluationSessionRepository
 * @typedef {import('./index.js').Services} Services
 */
import { NotFinalizedSessionError } from '../../../../shared/domain/errors.js';
import CertificationCancelled from '../../../../shared/domain/events/CertificationCancelled.js';
import { CertificationCourseUnrejected } from '../../../../shared/domain/events/CertificationCourseUnrejected.js';
import CertificationUncancelled from '../../../../shared/domain/events/CertificationUncancelled.js';
import { checkEventTypes } from '../../../../shared/domain/events/check-event-types.js';
import { AssessmentResultFactory } from '../../../scoring/domain/models/factories/AssessmentResultFactory.js';
import { SessionAlreadyPublishedError } from '../../../session-management/domain/errors.js';
import { CertificationCourseRejected } from '../../../session-management/domain/events/CertificationCourseRejected.js';
import { CertificationJuryDone } from '../../../session-management/domain/events/CertificationJuryDone.js';
import { assessmentResultRepository as injectedAssessmentResultRepository } from '../../../session-management/infrastructure/repositories/index.js';
import * as injectedCertificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import * as injectedComplementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import * as injectedEvaluationSessionRepository from '../../infrastructure/repositories/session-repository.js';
import { CertificationComputeError } from '../errors.js';
import CertificationRescored from '../events/CertificationRescored.js';
import { ChallengeDeneutralized } from '../events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../events/ChallengeNeutralized.js';
import { services as injectedServices } from '../services/index.js';

const eventTypes = [
  ChallengeNeutralized,
  ChallengeDeneutralized,
  CertificationJuryDone,
  CertificationCourseRejected,
  CertificationCourseUnrejected,
  CertificationCancelled,
  CertificationRescored,
  CertificationUncancelled,
];

/**
 * @param {Object} params
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 * @param {ComplementaryCertificationScoringCriteriaRepository} params.complementaryCertificationScoringCriteriaRepository
 * @param {EvaluationSessionRepository} params.evaluationSessionRepository
 * @param {Services} services
 *
 * @returns {Promise<void>}
 * @throws {Error} unrecognized event
 * @throws {NotFinalizedSessionError}
 * @throws {SessionAlreadyPublishedError}
 */
export const rescoreV2Certification = async ({
  event,
  assessmentResultRepository = injectedAssessmentResultRepository,
  certificationAssessmentRepository = injectedCertificationAssessmentRepository,
  complementaryCertificationScoringCriteriaRepository = injectedComplementaryCertificationScoringCriteriaRepository,
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

  return _handleV2CertificationScoring({
    certificationAssessment,
    event,
    assessmentResultRepository,
    complementaryCertificationScoringCriteriaRepository,
    services,
  });
};

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

async function _handleV2CertificationScoring({
  event,
  certificationAssessment,
  assessmentResultRepository,
  complementaryCertificationScoringCriteriaRepository,
  services,
}) {
  try {
    const certificationCourse = await services.handleV2CertificationScoring({
      event,
      certificationAssessment,
    });

    const complementaryCertificationScoringCriteria =
      await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({
        certificationCourseId: certificationCourse.getId(),
      });

    if (complementaryCertificationScoringCriteria.length > 0) {
      await services.scoreComplementaryCertificationV2({
        certificationCourseId: certificationCourse.getId(),
        complementaryCertificationScoringCriteria: complementaryCertificationScoringCriteria[0],
      });
    }
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      assessmentResultRepository,
      certificationComputeError: error,
      juryId: event.juryId,
    });
  }
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationComputeError,
  juryId,
}) {
  const assessmentResult = AssessmentResultFactory.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    juryId,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
}
