import _ from 'lodash';

import * as injectedCampaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedCampaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as injectedAreaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedCompetenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import { repositories as injectedRepositories } from '../../../shared/infrastructure/repositories/index.js';
import * as injectedCompetenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import { CompetenceResetError } from '../errors.js';
import { Scorecard } from '../models/Scorecard.js';
import * as injectedScorecardService from '../services/scorecard-service.js';

const resetScorecard = async function ({
  userId,
  competenceId,
  scorecardService = injectedScorecardService,
  competenceRepository = injectedCompetenceRepository,
  areaRepository = injectedAreaRepository,
  competenceEvaluationRepository = injectedCompetenceEvaluationRepository,
  knowledgeElementRepository = injectedRepositories.knowledgeElementRepository,
  assessmentRepository = injectedAssessmentRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  campaignRepository = injectedCampaignRepository,
  locale,
} = {}) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId,
    competenceId,
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
    userId,
  });

  await scorecardService.resetScorecard({
    competenceId,
    userId,
    shouldResetCompetenceEvaluation: isCompetenceEvaluationExists,
    assessmentRepository,
    campaignParticipationRepository,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    campaignRepository,
  });

  return scorecardService.computeScorecard({
    userId,
    competenceId,
    competenceRepository,
    areaRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    locale,
  });
};

export { resetScorecard };
