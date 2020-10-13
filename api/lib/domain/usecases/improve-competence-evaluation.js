const Assessment = require('../models/Assessment');
const { MAX_REACHABLE_LEVEL } = require('../constants');
const { ImproveCompetenceEvaluationForbiddenError } = require('../errors');

module.exports = async function improveCompetenceEvaluation({
  competenceEvaluationRepository,
  getCompetenceLevel,
  assessmentRepository,
  userId,
  competenceId,
  domainTransaction,
}) {
  const competenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({
    competenceId,
    userId,
    domainTransaction,
  });
  const competenceLevel = await getCompetenceLevel({ userId, competenceId });

  if (competenceLevel === MAX_REACHABLE_LEVEL) {
    throw new ImproveCompetenceEvaluationForbiddenError();
  }

  const assessment = new Assessment({
    userId,
    competenceId,
    state: Assessment.states.STARTED,
    type: Assessment.types.COMPETENCE_EVALUATION,
    courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION,
    isImproving: true,
  });
  const { id: assessmentId } = await assessmentRepository.save({ assessment, domainTransaction });

  await competenceEvaluationRepository.updateAssessmentId({
    currentAssessmentId: competenceEvaluation.assessmentId,
    newAssessmentId: assessmentId,
    domainTransaction,
  });

  return { ...competenceEvaluation, assessmentId };
};
