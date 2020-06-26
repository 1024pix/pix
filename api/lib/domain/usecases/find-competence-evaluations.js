const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCompetenceEvaluations({
  userId,
  options,
  assessmentRepository,
  competenceEvaluationRepository,
}) {
  if (!(await assessmentRepository.belongsToUser(options.filter.assessmentId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this competence evaluation');
  }

  return competenceEvaluationRepository.find(options);
};
