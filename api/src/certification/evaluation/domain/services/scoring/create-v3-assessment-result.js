import { config } from '../../../../../shared/config.js';
import { AssessmentResultFactory } from '../../../../scoring/domain/models/factories/AssessmentResultFactory.js';

export function createV3AssessmentResult({
  toBeCancelled,
  allAnswers,
  assessmentId,
  certificationAssessmentScore,
  isRejectedForFraud,
  isAbortReasonTechnical,
  juryId,
}) {
  if (toBeCancelled) {
    return AssessmentResultFactory.buildCancelledAssessmentResult({
      juryId,
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId,
    });
  }
  if (isRejectedForFraud) {
    return AssessmentResultFactory.buildFraud({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId,
      juryId,
    });
  }

  if (_candidateDidNotAnswerEnoughV3CertificationQuestions(allAnswers)) {
    if (isAbortReasonTechnical) {
      return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
        pixScore: certificationAssessmentScore.nbPix,
        reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
        assessmentId,
        juryId,
      });
    } else {
      return AssessmentResultFactory.buildLackOfAnswers({
        pixScore: certificationAssessmentScore.nbPix,
        reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
        status: certificationAssessmentScore.status,
        assessmentId,
        juryId,
      });
    }
  }

  if (certificationAssessmentScore.nbPix === 0) {
    return AssessmentResultFactory.buildRejectedDueToZeroPixScore({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId,
      juryId,
      competenceMarks: certificationAssessmentScore.competenceMarks,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId,
    juryId,
  });
}

function _candidateDidNotAnswerEnoughV3CertificationQuestions(allAnswers) {
  return allAnswers.length < config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
}
