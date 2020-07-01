const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const scoringService = require('./scoring/scoring-service');

module.exports = async function getCompetenceLevel({
  userId,
  competenceId
}) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId });
  const { currentLevel } = scoringService.calculateScoringInformationForCompetence({ knowledgeElements });
  return currentLevel;
};

