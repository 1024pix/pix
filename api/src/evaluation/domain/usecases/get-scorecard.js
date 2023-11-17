import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors.js';
import { Scorecard } from '../models/Scorecard.js';

const getScorecard = async function ({
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

export { getScorecard };
