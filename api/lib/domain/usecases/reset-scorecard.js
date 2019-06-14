const Scorecard = require('../models/Scorecard');
const { UserNotAuthorizedToAccessEntity, CompetenceResetError } = require('../errors');
const _ = require('lodash');

module.exports = async function resetScorecard({
  authenticatedUserId,
  requestedUserId,
  competenceId,
  scorecardService,
  competenceRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId: authenticatedUserId,
    competenceId
  });

  const nothingToReset = _.isEmpty(knowledgeElements);
  if (nothingToReset) {
    return null;
  }

  const remainingDaysBeforeReset = Scorecard.computeRemainingDaysBeforeReset(knowledgeElements);

  if (remainingDaysBeforeReset > 0) {
    throw new CompetenceResetError(remainingDaysBeforeReset);
  }

  const isCompetenceEvaluationExists = await competenceEvaluationRepository.existsByCompetenceIdAndUserId({
    competenceId,
    userId: authenticatedUserId
  });

  await scorecardService.resetScorecard({
    competenceId,
    userId: authenticatedUserId,
    shouldResetCompetenceEvaluation: isCompetenceEvaluationExists,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository
  });

  return scorecardService.computeScorecard({
    userId: authenticatedUserId,
    competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository
  });
};
