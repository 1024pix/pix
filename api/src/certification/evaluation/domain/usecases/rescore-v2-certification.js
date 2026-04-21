/**
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('./index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('./index.js').ScoringV2Service} ScoringV2Service
 * @typedef {import('./index.js').ComplementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').Services} Services
 */
import { NotFinalizedSessionError } from '../../../../shared/domain/errors.js';
import CertificationCancelled from '../../../../shared/domain/events/CertificationCancelled.js';
import { CertificationCourseUnrejected } from '../../../../shared/domain/events/CertificationCourseUnrejected.js';
import CertificationUncancelled from '../../../../shared/domain/events/CertificationUncancelled.js';
import { checkEventTypes } from '../../../../shared/domain/events/check-event-types.js';
import { SessionAlreadyPublishedError } from '../../../session-management/domain/errors.js';
import { CertificationCourseRejected } from '../../../session-management/domain/events/CertificationCourseRejected.js';
import { CertificationJuryDone } from '../../../session-management/domain/events/CertificationJuryDone.js';
import { CertificationComputeError } from '../errors.js';
import CertificationRescored from '../events/CertificationRescored.js';
import { ChallengeDeneutralized } from '../events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../events/ChallengeNeutralized.js';
import { AssessmentResultFactory } from '../models/factories/AssessmentResultFactory.js';

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
export const rescoreV2Certification = async ({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  complementaryCertificationScoringCriteriaRepository,
  sessionRepository,
  services,
}) => {
  checkEventTypes(event, eventTypes);

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
};

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {SessionRepository} params.sessionRepository
 *
 * @returns {Promise<void>}
 * @throws {NotFinalizedSessionError}
 * @throws {SessionAlreadyPublishedError}
 */
const _verifySessionIsPublishable = async ({ certificationCourseId, sessionRepository }) => {
  const session = await sessionRepository.getByCertificationCourseId({ certificationCourseId });

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
