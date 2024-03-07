import * as scoringService from '../../../../lib/domain/services/scoring/scoring-service.js';
import * as knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository.js';

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
