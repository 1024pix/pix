import { UserNotAuthorizedToAccessEntityError } from '../errors.js';
import { Scorecard } from '../models/Scorecard.js';

const getScorecard = async function ({
  authenticatedUserId,
  scorecardId,
  scorecardService,
  competenceRepository,
  areaRepository,
  skillRepository,
  tubeRepository,
  smartRandom,
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
    skillRepository,
    tubeRepository,
    smartRandom,
    knowledgeElementRepository,
    locale,
  });
};

export { getScorecard };
