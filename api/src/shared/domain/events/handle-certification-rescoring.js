/**
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 */
import { ChallengeDeneutralized } from '../../../certification/evaluation/domain/events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../../../certification/evaluation/domain/events/ChallengeNeutralized.js';
import { services } from '../../../certification/evaluation/domain/services/index.js';
import { AssessmentResultFactory } from '../../../certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { CertificationCourseRejected } from '../../../certification/session-management/domain/events/CertificationCourseRejected.js';
import { CertificationJuryDone } from '../../../certification/session-management/domain/events/CertificationJuryDone.js';
import CertificationRescoredByScript from '../../../certification/session-management/domain/events/CertificationRescoredByScript.js';
import { AlgorithmEngineVersion } from '../../../certification/shared/domain/models/AlgorithmEngineVersion.js';
import { V3_REPRODUCIBILITY_RATE } from '../constants.js';
import { CertificationComputeError } from '../errors.js';
import CertificationCancelled from './CertificationCancelled.js';
import { CertificationCourseUnrejected } from './CertificationCourseUnrejected.js';
import { CertificationRescoringCompleted } from './CertificationRescoringCompleted.js';
import CertificationUncancelled from './CertificationUncancelled.js';
import { checkEventTypes } from './check-event-types.js';

const eventTypes = [
  ChallengeNeutralized,
  ChallengeDeneutralized,
  CertificationJuryDone,
  CertificationCourseRejected,
  CertificationCourseUnrejected,
  CertificationCancelled,
  CertificationRescoredByScript,
  CertificationUncancelled,
];

/**
 * @param {Object} params
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 */
async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  scoringCertificationService,
  certificationEvaluationServices,
  certificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId: event.certificationCourseId,
  });

  if (certificationAssessment.isScoringBlockedDueToComplementaryOnlyChallenges) {
    return;
  }

  if (AlgorithmEngineVersion.isV3(certificationAssessment.version)) {
    return _handleV3CertificationScoring({
      certificationAssessment,
      event,
      locale: event.locale,
      certificationCourseRepository,
      certificationEvaluationServices,
    });
  }

  return _handleV2CertificationScoring({
    scoringCertificationService,
    certificationAssessment,
    event,
    assessmentResultRepository,
    certificationCourseRepository,
    certificationEvaluationServices,
  });
}

async function _handleV2CertificationScoring({
  event,
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  scoringCertificationService,
  certificationEvaluationServices,
}) {
  try {
    const { certificationCourse, certificationAssessmentScore } =
      await certificationEvaluationServices.handleV2CertificationScoring({
        event,
        certificationAssessment,
      });

    // isCancelled will be removed
    // this block will be removed
    await _toggleCertificationCourseCancellationIfNotTrustableOrLackOfAnswersForTechnicalReason({
      certificationCourse,
      hasEnoughNonNeutralizedChallengesToBeTrusted:
        certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted,
      certificationCourseRepository,
      certificationAssessmentScore,
      scoringCertificationService,
    });

    return new CertificationRescoringCompleted({
      userId: certificationAssessment.userId,
      certificationCourseId: certificationAssessment.certificationCourseId,
      reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
    });
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
      juryId: event.juryId,
    });
  }
}

async function _handleV3CertificationScoring({
  certificationAssessment,
  event,
  locale,
  certificationCourseRepository,
  certificationEvaluationServices,
}) {
  const certificationCourse = await certificationEvaluationServices.handleV3CertificationScoring({
    event,
    certificationAssessment,
    locale,
    dependencies: { findByCertificationCourseIdAndAssessmentId: services.findByCertificationCourseIdAndAssessmentId },
  });

  // isCancelled will be removed
  if (certificationCourse.isCancelled()) {
    await certificationCourseRepository.update({ certificationCourse });
  }

  return new CertificationRescoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: V3_REPRODUCIBILITY_RATE,
  });
}

async function _toggleCertificationCourseCancellationIfNotTrustableOrLackOfAnswersForTechnicalReason({
  certificationCourse,
  hasEnoughNonNeutralizedChallengesToBeTrusted,
  certificationCourseRepository,
  certificationAssessmentScore,
  scoringCertificationService,
}) {
  const lackOfAnswersForTechnicalReason = await scoringCertificationService.isLackOfAnswersForTechnicalReason({
    certificationCourse,
    certificationAssessmentScore,
  });

  if (!hasEnoughNonNeutralizedChallengesToBeTrusted || lackOfAnswersForTechnicalReason) {
    certificationCourse.cancel();
  } else {
    certificationCourse.uncancel();
  }

  return certificationCourseRepository.update({ certificationCourse });
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

handleCertificationRescoring.eventTypes = eventTypes;
export { handleCertificationRescoring };
