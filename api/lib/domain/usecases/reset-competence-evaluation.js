const Scorecard = require('../models/Scorecard');
const { UserNotAuthorizedToAccessEntity, CompetenceResetError, NotFoundError } = require('../errors');
const _ = require('lodash');
const competenceEvaluationService = require('../services/competence-evaluation-service');

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

  const nothingToReset = _.isEmpty(knowledgeElements);
  if (nothingToReset) {
    return null;
  }

  const remainingDaysBeforeReset = Scorecard.computeRemainingDaysBeforeReset(knowledgeElements);

  if (remainingDaysBeforeReset > 0) {
    throw new CompetenceResetError(remainingDaysBeforeReset);
  }

  let isCompetenceEvaluationExists = true;

  try {
    await competenceEvaluationRepository.getByCompetenceIdAndUserId({
      competenceId, userId: authenticatedUserId
    });
  } catch (err) {
    // If user wants to reset its knowledge elements on a competence,
    // but has only validated or invalidated them on campaigns.
    if (err instanceof NotFoundError) {
      isCompetenceEvaluationExists = false;
    } else {
      throw err;
    }
  }

  return competenceEvaluationService.resetCompetenceEvaluation({
    competenceEvaluationRepository,
    knowledgeElementRepository,
    competenceId,
    userId: authenticatedUserId,
    isCompetenceEvaluationExists
  });
};
