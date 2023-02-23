const { UserNotAuthorizedToAccessEntityError } = require('../errors.js');
const Scorecard = require('../models/Scorecard.js');

module.exports = async function getScorecard({
  authenticatedUserId,
  scorecardId,
  scorecardService,
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  locale,
}) {
  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (authenticatedUserId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  return scorecardService.computeScorecard({
    userId: authenticatedUserId,
    competenceId,
    competenceRepository,
    areaRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    locale,
  });
};
