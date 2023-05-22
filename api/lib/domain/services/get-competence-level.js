import * as knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository.js';
import * as scoringService from './scoring/scoring-service.js';

const getCompetenceLevel = async function ({
  userId,
  competenceId,
  domainTransaction,

  dependencies = {
    knowledgeElementRepository,
    scoringService,
  },
}) {
  const knowledgeElements = await dependencies.knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId,
    competenceId,
    domainTransaction,
  });
  const { currentLevel } = dependencies.scoringService.calculateScoringInformationForCompetence({ knowledgeElements });
  return currentLevel;
};

export { getCompetenceLevel };
