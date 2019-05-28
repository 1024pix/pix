const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const Scorecard = require('../models/Scorecard');
const { UserNotAuthorizedToAccessEntity, CompetenceResetError, NotFoundError } = require('../errors');

module.exports = async function resetCompetenceEvaluation({
  authenticatedUserId,
  requestedUserId,
  competenceId,
  competenceEvaluationRepository,
  knowledgeElementRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId: authenticatedUserId, competenceId });

  const remainingDaysBeforeReset = Scorecard.computeRemainingDaysBeforeReset(knowledgeElements);

  if (remainingDaysBeforeReset > 0) {
    throw new CompetenceResetError(remainingDaysBeforeReset);
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
