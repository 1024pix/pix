import { isEduFramework } from '../../../../shared/domain/models/Frameworks.js';
import { AssessmentResultFactory } from '../../models/factories/AssessmentResultFactory.js';

export function createV3AssessmentResult({
  toBeCancelled,
  allAnswers,
  assessmentId,
  pixScore,
  capacity,
  reachedMeshIndex,
  versionId,
  status,
  competenceMarks,
  isRejectedForFraud,
  isAbortReasonTechnical,
  juryId,
  minimumAnswersRequiredToValidateACertification,
  certificationFramework,
}) {
  if (toBeCancelled) {
    return AssessmentResultFactory.buildCancelledByJuryAssessmentResult({
      juryId,
      pixScore: null,
      assessmentId,
      competenceMarks: [],
      capacity: null,
      reachedMeshIndex: null,
      versionId,
    });
  }
  if (isRejectedForFraud) {
    return AssessmentResultFactory.buildFraud({
      pixScore: null,
      assessmentId,
      juryId,
      competenceMarks: [],
      capacity: null,
      reachedMeshIndex: null,
      versionId,
    });
  }

  if (
    _candidateDidNotAnswerEnoughV3CertificationQuestions(allAnswers, minimumAnswersRequiredToValidateACertification)
  ) {
    if (isAbortReasonTechnical) {
      return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
        pixScore: null,
        assessmentId,
        juryId,
        competenceMarks: [],
        capacity: null,
        reachedMeshIndex: null,
        versionId,
      });
    } else {
      return AssessmentResultFactory.buildLackOfAnswers({
        pixScore: null,
        assessmentId,
        juryId,
        competenceMarks: [],
        capacity: null,
        reachedMeshIndex: null,
        versionId,
      });
    }
  }

  if (isEduFramework(certificationFramework) && reachedMeshIndex === null) {
    return AssessmentResultFactory.buildRejectedNotEligibleEduAssessmentResult({
      assessmentId,
      juryId,
      capacity,
      reachedMeshIndex,
      versionId,
      certificationFramework,
    });
  }

  if (pixScore === 0 || reachedMeshIndex === null) {
    return AssessmentResultFactory.buildRejectedDueToBelowMinimumMesh({
      pixScore,
      assessmentId,
      juryId,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore,
    status,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  });
}

function _candidateDidNotAnswerEnoughV3CertificationQuestions(
  allAnswers,
  minimumAnswersRequiredToValidateACertification,
) {
  return allAnswers.length < minimumAnswersRequiredToValidateACertification;
}
