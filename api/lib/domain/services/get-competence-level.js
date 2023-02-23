const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository.js');
const scoringService = require('./scoring/scoring-service.js');

module.exports = async function getCompetenceLevel({ userId, competenceId, domainTransaction }) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId,
    competenceId,
    domainTransaction,
  });
  const { currentLevel } = scoringService.calculateScoringInformationForCompetence({ knowledgeElements });
  return currentLevel;
};
