/**
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('./index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('./index.js').ScoringV2Service} ScoringV2Service
 * @typedef {import('./index.js').ComplementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').Services} Services
 */
import { NotFinalizedSessionError, NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionAlreadyPublishedError } from '../../../session-management/domain/errors.js';
import { CertificationComputeError } from '../errors.js';
import { AssessmentResultFactory } from '../models/factories/AssessmentResultFactory.js';

/**
 * @param {object} params
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 * @param {ComplementaryCertificationScoringCriteriaRepository} params.complementaryCertificationScoringCriteriaRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {Services} services
 *
 * @returns {Promise<void>}
 * @throws {Error} unrecognized event
 * @throws {NotFinalizedSessionError}
 * @throws {SessionAlreadyPublishedError}
 */
export async function rescoreV2Certification({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  complementaryCertificationScoringCriteriaRepository,
  sessionRepository,
  services,
}) {
  const certificationCourseId = event.certificationCourseId;

  await _verifySessionIsPublishable({ certificationCourseId, sessionRepository });

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });

  return _handleV2CertificationScoring({
    certificationAssessment,
    event,
    assessmentResultRepository,
    complementaryCertificationScoringCriteriaRepository,
    services,
  });
}

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {SessionRepository} params.sessionRepository
 *
 * @returns {Promise<void>}
 * @throws {NotFoundError}
 * @throws {NotFinalizedSessionError}
 * @throws {SessionAlreadyPublishedError}
 */
async function _verifySessionIsPublishable({ certificationCourseId, sessionRepository }) {
  const session = await sessionRepository.getByCertificationCourseId({ certificationCourseId });

  if (!session) {
    throw new NotFoundError(`Session does not exist for certificationCourseId ${certificationCourseId}`);
  }

  if (!session.isFinalized) {
    throw new NotFinalizedSessionError();
  }

  if (session.isPublished) {
    throw new SessionAlreadyPublishedError();
  }
}

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
