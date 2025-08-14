import { MAX_REACHABLE_LEVEL } from '../../../shared/domain/constants.js';
import { Assessment } from '../../../shared/domain/models/Assessment.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedCompetenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import { ImproveCompetenceEvaluationForbiddenError } from '../errors.js';
import { getCompetenceLevel as injectedGetCompetenceLevel } from '../services/get-competence-level.js';

const improveCompetenceEvaluation = async function ({
  competenceEvaluationRepository = injectedCompetenceEvaluationRepository,
  getCompetenceLevel = injectedGetCompetenceLevel,
  assessmentRepository = injectedAssessmentRepository,
  userId,
  competenceId,
} = {}) {
  let competenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({
    competenceId,
    userId,
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

  const { id: assessmentId } = await assessmentRepository.save({ assessment });

  competenceEvaluation = await competenceEvaluationRepository.updateAssessmentId({
    currentAssessmentId: competenceEvaluation.assessmentId,
    newAssessmentId: assessmentId,
  });

  return { ...competenceEvaluation, assessmentId };
};

export { improveCompetenceEvaluation };
