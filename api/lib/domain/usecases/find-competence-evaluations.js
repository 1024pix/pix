const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCompetenceEvaluations({
  userId,
  options,
  competenceEvaluationRepository,
  smartPlacementAssessmentRepository,
}) {
  if(options.filter.assessmentId ){
    if (!(await smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(options.filter.assessmentId, userId))) {
      throw new UserNotAuthorizedToAccessEntity('User does not have an access to this competence evaluation');
    }
  }
  options.filter.userId = userId;
  return competenceEvaluationRepository.find(options);
};
