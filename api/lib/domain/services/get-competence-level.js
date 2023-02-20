import knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository';
import scoringService from './scoring/scoring-service';

export default async function getCompetenceLevel({ userId, competenceId, domainTransaction }) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId,
    competenceId,
    domainTransaction,
  });
  const { currentLevel } = scoringService.calculateScoringInformationForCompetence({ knowledgeElements });
  return currentLevel;
}
