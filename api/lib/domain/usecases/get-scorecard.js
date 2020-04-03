const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async function getScorecard({ authenticatedUserId, scorecardId, scorecardService, competenceRepository, competenceEvaluationRepository, knowledgeElementRepository }) {

  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (authenticatedUserId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  return scorecardService.computeScorecard({
    userId: authenticatedUserId,
    competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
  });
};

