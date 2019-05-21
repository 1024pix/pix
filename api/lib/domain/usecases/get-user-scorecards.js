const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, requestedUserId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [knowledgeElementsGroupedByCompetenceId, competencesWithArea, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId: requestedUserId }),
    competenceRepository.list(),
    competenceEvaluationRepository.findByUserId(requestedUserId),
  ]);

  return _.map(competencesWithArea, (competence) => {
    const knowledgeElementsForCompetence = knowledgeElementsGroupedByCompetenceId[competence.id];
    return Scorecard.buildFrom({ userId: requestedUserId, knowledgeElements: knowledgeElementsForCompetence, competence, competenceEvaluations });
  });
};

