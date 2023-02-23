const Assessment = require('../models/Assessment.js');
const { MAX_REACHABLE_LEVEL } = require('../constants.js');
const { ImproveCompetenceEvaluationForbiddenError } = require('../errors.js');

module.exports = async function improveCompetenceEvaluation({
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
