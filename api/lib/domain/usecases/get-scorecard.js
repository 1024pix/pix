const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, scorecardId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  const [userId, competenceId] = scorecardId.split('_');
  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [knowledgeElementsGroupedByCompetenceId, competence, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId: authenticatedUserId }),
    competenceRepository.get(competenceId),
    competenceEvaluationRepository.findByUserId(authenticatedUserId),
  ]);

  const knowledgeElements = knowledgeElementsGroupedByCompetenceId[competence.id];
  return Scorecard.buildFrom({ userId: authenticatedUserId, knowledgeElements, competence, competenceEvaluations });
};

