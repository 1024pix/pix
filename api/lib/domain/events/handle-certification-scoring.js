import { AssessmentResultFactory } from '../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { CertificationVersion } from '../../../src/certification/shared/domain/models/CertificationVersion.js';
import { V3_REPRODUCIBILITY_RATE } from '../constants.js';
import { CertificationComputeError } from '../errors.js';
import { AssessmentResult } from '../models/index.js';
import { AssessmentCompleted } from './AssessmentCompleted.js';
import { CertificationScoringCompleted } from './CertificationScoringCompleted.js';
import { checkEventTypes } from './check-event-types.js';

const eventTypes = [AssessmentCompleted];

async function handleCertificationScoring({
  event,
  assessmentResultRepository,
  certificationAssessmentHistoryRepository,
  certificationAssessmentRepository,
  certificationCourseRepository,
  certificationChallengeForScoringRepository,
  competenceMarkRepository,
  scoringConfigurationRepository,
  scoringCertificationService,
  answerRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  scoringDegradationService,
  challengeRepository,
}) {
  checkEventTypes(event, eventTypes);

  if (!event.isCertificationType) {
    return null;
  }

  const certificationAssessment = await certificationAssessmentRepository.get(event.assessmentId);

  if (CertificationVersion.isV3(certificationAssessment.version)) {
    return _handleV3CertificationScoring({
      certificationAssessment,
      locale: event.locale,
      answerRepository,
      assessmentResultRepository,
      certificationAssessmentHistoryRepository,
      certificationChallengeForScoringRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      flashAlgorithmConfigurationRepository,
      flashAlgorithmService,
      scoringConfigurationRepository,
      scoringCertificationService,
      scoringDegradationService,
      challengeRepository,
    });
  }

  return _handleV2CertificationScoring({
    certificationAssessment,
    assessmentResultRepository,
    certificationCourseRepository,
    competenceMarkRepository,
    scoringCertificationService,
  });
}

async function _handleV2CertificationScoring({
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  const emitter = AssessmentResult.emitters.PIX_ALGO;

  try {
    const { certificationCourse, certificationAssessmentScore } =
      await scoringCertificationService.handleV2CertificationScoring({
        emitter,
        certificationAssessment,
        assessmentResultRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringCertificationService,
      });

    certificationCourse.complete({ now: new Date() });

    const lackOfAnswersForTechnicalReason = await scoringCertificationService.isLackOfAnswersForTechnicalReason({
      certificationCourse,
      certificationAssessmentScore,
    });

    if (lackOfAnswersForTechnicalReason) {
      certificationCourse.cancel();
    }

    await certificationCourseRepository.update({ certificationCourse });

    return new CertificationScoringCompleted({
      userId: certificationAssessment.userId,
      certificationCourseId: certificationAssessment.certificationCourseId,
      reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
    });
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      emitter,
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _handleV3CertificationScoring({
  certificationAssessment,
  locale,
  answerRepository,
  assessmentResultRepository,
  certificationAssessmentHistoryRepository,
  certificationChallengeForScoringRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  scoringConfigurationRepository,
  scoringCertificationService,
  scoringDegradationService,
  challengeRepository,
}) {
  const emitter = AssessmentResult.emitters.PIX_ALGO;
  const certificationCourse = await scoringCertificationService.handleV3CertificationScoring({
    certificationAssessment,
    emitter,
    locale,
    answerRepository,
    assessmentResultRepository,
    certificationAssessmentHistoryRepository,
    certificationChallengeForScoringRepository,
    certificationCourseRepository,
    competenceMarkRepository,
    flashAlgorithmConfigurationRepository,
    flashAlgorithmService,
    scoringDegradationService,
    scoringConfigurationRepository,
    challengeRepository,
  });

  if (!certificationCourse.isCancelled()) {
    certificationCourse.complete({ now: new Date() });
  }
  await certificationCourseRepository.update({ certificationCourse });

  return new CertificationScoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: V3_REPRODUCIBILITY_RATE,
  });
}

async function _saveResultAfterCertificationComputeError({
  emitter,
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const certificationCourse = await certificationCourseRepository.get({
    id: certificationAssessment.certificationCourseId,
  });
  const assessmentResult = AssessmentResultFactory.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    emitter,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  certificationCourse.complete({ now: new Date() });
  return certificationCourseRepository.update({ certificationCourse });
}

handleCertificationScoring.eventTypes = eventTypes;
export { handleCertificationScoring };
