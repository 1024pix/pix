const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const { UserNotAuthorizedToAccessEntity, NotFoundError } = require('../errors');

module.exports = async function resetCompetenceEvaluation({
  authenticatedUserId,
  requestedUserId,
  competenceId,
  competenceEvaluationRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  try {
    await competenceEvaluationRepository.getByCompetenceIdAndUserId(competenceId, authenticatedUserId);
  } catch (err) {
    // If user wants to reset its knowledge elements on a competence, but has only validated or invalidated them on campaigns
    if (err instanceof NotFoundError) {
      return null;
    } else {
      throw err;
    }
  }

  return competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId(authenticatedUserId, competenceId, CompetenceEvaluation.statuses.RESET);
};
