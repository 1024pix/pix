const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository.js');
const scoringService = require('./scoring/scoring-service.js');

module.exports = async function getCompetenceLevel({
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
