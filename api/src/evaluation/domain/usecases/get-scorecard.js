import { UserNotAuthorizedToAccessEntityError } from '../../../shared/domain/errors.js';
import * as injectedAreaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as injectedCompetenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as injectedCompetenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import { Scorecard } from '../models/Scorecard.js';
import * as injectedScorecardService from '../services/scorecard-service.js';

const getScorecard = async function ({
  authenticatedUserId,
  scorecardId,
  scorecardService = injectedScorecardService,
  competenceRepository = injectedCompetenceRepository,
  areaRepository = injectedAreaRepository,
  competenceEvaluationRepository = injectedCompetenceEvaluationRepository,
  knowledgeElementRepository,
  locale,
} = {}) {
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
