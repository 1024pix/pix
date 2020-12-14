const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCompetenceEvaluationsByAssessment({
  userId,
  assessmentId,
  assessmentRepository,
  competenceEvaluationRepository,
}) {
  if (!(await assessmentRepository.ownedByUser({ id: assessmentId, userId }))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this competence evaluation');
  }

  return competenceEvaluationRepository.findByAssessmentId(assessmentId);
};
