import * as competenceScoreRepository from '../../../shared/infrastructure/repositories/competence-score-repository.js';
import * as knowledgeStateRepository from '../../../shared/infrastructure/repositories/knowledge-state-repository.js';
import * as scoringService from './scoring/scoring-service.js';

const getCompetenceLevel = async function ({
  userId,
  competenceId,

  dependencies = {
    knowledgeStateRepository,
    competenceScoreRepository,
    scoringService,
  },
}) {
  // Le niveau se lit sur le solde de la compétence, figé à la dernière action.
  const pixByCompetence = await dependencies.competenceScoreRepository.findByUserId({ userId });
  const exactlyEarnedPix = pixByCompetence.get(competenceId);
  if (exactlyEarnedPix !== undefined) {
    return dependencies.scoringService.calculateScoringInformationFromPix({ exactlyEarnedPix }).currentLevel;
  }

  const knowledgeState = await dependencies.knowledgeStateRepository.findByUserId({ userId });
  const { currentLevel } = dependencies.scoringService.calculateScoringInformationForCompetence({
    validatedSkills: knowledgeState.restrictedToCompetence(competenceId).validatedSkills(),
  });
  return currentLevel;
};

export { getCompetenceLevel };
