const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, requestedUserId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [knowledgeElements, competencesWithArea, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserId({ userId: requestedUserId }),
    competenceRepository.list(),
    competenceEvaluationRepository.findByUserId(requestedUserId),
  ]);

  const knowledgeElementsGroupedByCompetenceId = _.groupBy(knowledgeElements, 'competenceId');

  return _.map(competencesWithArea, (competence) => {
    const knowledgeElementsForCompetence = knowledgeElementsGroupedByCompetenceId[competence.id];
    return Scorecard.buildFrom({ userId: requestedUserId, knowledgeElements: knowledgeElementsForCompetence, competence, competenceEvaluations });
  });
};

