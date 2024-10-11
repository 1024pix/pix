/**
 * @typedef {import('../index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../index.js').ScoringDegradationService} ScoringDegradationService
 */

import { AssessmentResult } from '../../../../../shared/domain/models/AssessmentResult.js';
import { CompetenceMark } from '../../../../../shared/domain/models/index.js';
import { AssessmentResultFactory } from '../../../../scoring/domain/models/factories/AssessmentResultFactory.js';

/**
 * @param {Object} params
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 * @param {ScoringDegradationService} params.scoringDegradationService
 */
export const handleV2CertificationScoring = async ({
  event,
  emitter,
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) => {
  const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
    certificationAssessment,
    continueOnError: false,
  });
  const certificationCourse = await certificationCourseRepository.get({
    id: certificationAssessment.certificationCourseId,
  });

  const assessmentResult = _createV2AssessmentResult({
    juryId: event?.juryId,
    emitter,
    certificationCourse,
    certificationAssessment,
    certificationAssessmentScore,
    scoringCertificationService,
  });

  await _saveV2Result({
    assessmentResult,
    certificationCourseId: certificationAssessment.certificationCourseId,
    certificationAssessmentScore,
    assessmentResultRepository,
    competenceMarkRepository,
  });

  return { certificationCourse, certificationAssessmentScore };
};

/**
 * @param {Object} params
 * @param {ScoringDegradationService} params.scoringDegradationService
 */
function _createV2AssessmentResult({
  juryId,
  emitter,
  certificationCourse,
  certificationAssessmentScore,
  certificationAssessment,
  scoringCertificationService,
}) {
  if (certificationCourse.isRejectedForFraud()) {
    return AssessmentResultFactory.buildFraud({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId,
    });
  }

  if (!certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted) {
    return AssessmentResultFactory.buildNotTrustableAssessmentResult({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter,
      juryId,
    });
  }

  if (
    scoringCertificationService.isLackOfAnswersForTechnicalReason({ certificationAssessmentScore, certificationCourse })
  ) {
    return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
      emitter,
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      status: AssessmentResult.status.REJECTED,
      juryId,
    });
  }

  if (certificationAssessmentScore.hasInsufficientCorrectAnswers()) {
    return AssessmentResultFactory.buildInsufficientCorrectAnswers({
      emitter,
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter,
    juryId,
  });
}

/**
 * @param {Object} params
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 */
async function _saveV2Result({
  assessmentResult,
  certificationCourseId,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const { id: assessmentResultId } = await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });

  for (const competenceMark of certificationAssessmentScore.competenceMarks) {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, assessmentResultId });
    await competenceMarkRepository.save(competenceMarkDomain);
  }
}
