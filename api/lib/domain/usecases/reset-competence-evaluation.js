const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function resetCompetenceEvaluation({
  authenticatedUserId,
  requestedUserId,
  competenceId,
  competenceEvaluationRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  return competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId(authenticatedUserId, competenceId, CompetenceEvaluation.statuses.RESET);
};
