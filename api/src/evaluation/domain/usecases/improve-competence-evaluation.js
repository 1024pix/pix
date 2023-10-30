import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { MAX_REACHABLE_LEVEL } from '../../../../lib/domain/constants.js';
import { ImproveCompetenceEvaluationForbiddenError } from '../../../../lib/domain/errors.js';

const improveCompetenceEvaluation = async function ({
  competenceEvaluationRepository,
  getCompetenceLevel,
  assessmentRepository,
  userId,
  competenceId,
  domainTransaction,
}) {
  let competenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({
    competenceId,
    userId,
    domainTransaction,
    forUpdate: true,
  });

  if (competenceEvaluation.assessment.isStarted() && competenceEvaluation.assessment.isImproving) {
    return { ...competenceEvaluation, assessmentId: competenceEvaluation.assessmentId };
  }

  const competenceLevel = await getCompetenceLevel({ userId, competenceId });

  if (competenceLevel === MAX_REACHABLE_LEVEL) {
    throw new ImproveCompetenceEvaluationForbiddenError();
  }

  const assessment = Assessment.createImprovingForCompetenceEvaluation({ userId, competenceId });

  const { id: assessmentId } = await assessmentRepository.save({ assessment, domainTransaction });

  competenceEvaluation = await competenceEvaluationRepository.updateAssessmentId({
    currentAssessmentId: competenceEvaluation.assessmentId,
    newAssessmentId: assessmentId,
    domainTransaction,
  });

  return { ...competenceEvaluation, assessmentId };
};

export { improveCompetenceEvaluation };
