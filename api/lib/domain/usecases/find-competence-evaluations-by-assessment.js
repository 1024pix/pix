const { UserNotAuthorizedToAccessEntityError } = require('../errors.js');

module.exports = async function findCompetenceEvaluationsByAssessment({
  userId,
  assessmentId,
  assessmentRepository,
  competenceEvaluationRepository,
}) {
  if (!(await assessmentRepository.ownedByUser({ id: assessmentId, userId }))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have an access to this competence evaluation');
  }

  return competenceEvaluationRepository.findByAssessmentId(assessmentId);
};
