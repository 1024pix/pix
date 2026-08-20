import * as knowledgeStateRepository from '../../../shared/infrastructure/repositories/knowledge-state-repository.js';
import * as scoringService from './scoring/scoring-service.js';

const getCompetenceLevel = async function ({
  userId,
  competenceId,

  dependencies = {
    knowledgeStateRepository,
    scoringService,
  },
}) {
  const knowledgeState = await dependencies.knowledgeStateRepository.findByUserId({ userId });
  const { currentLevel } = dependencies.scoringService.calculateScoringInformationForCompetence({
    validatedSkills: knowledgeState.restrictedToCompetence(competenceId).validatedSkills(),
  });
  return currentLevel;
};

export { getCompetenceLevel };
