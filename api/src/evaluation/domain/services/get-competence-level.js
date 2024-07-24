import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as scoringService from './scoring/scoring-service.js';

const getCompetenceLevel = async function ({
  userId,
  competenceId,

  dependencies = {
    knowledgeElementRepository,
    scoringService,
  },
}) {
  const knowledgeElements = await dependencies.knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId,
    competenceId,
  });
  const { currentLevel } = dependencies.scoringService.calculateScoringInformationForCompetence({ knowledgeElements });
  return currentLevel;
};

export { getCompetenceLevel };
