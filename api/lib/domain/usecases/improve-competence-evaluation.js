const Assessment = require('../models/Assessment');

module.exports = async function improveCompetenceEvaluation({ competenceEvaluationRepository, assessmentRepository, userId, competenceId, domainTransaction }) {
  const competenceEvaluation = await competenceEvaluationRepository.getByCompetenceIdAndUserId({ competenceId, userId });
  const assessment = new Assessment({
    userId,
    competenceId,
    state: Assessment.states.STARTED,
    type: Assessment.types.COMPETENCE_EVALUATION,
    courseId: Assessment.courseIdMessage.COMPETENCE_EVALUATION,
    isImproving: true
  });
  const { id: assessmentId } = await assessmentRepository.save({ assessment, domainTransaction });

  await competenceEvaluationRepository.updateAssessmentId({
    currentAssessmentId: competenceEvaluation.assessmentId,
    newAssessmentId: assessmentId,
    domainTransaction
  });

  return { ...competenceEvaluation, assessmentId };
};
