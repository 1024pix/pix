const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');
const _ = require('lodash');

module.exports = async ({ authenticatedUserId, scorecardId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  const [userId, competenceId] = scorecardId.split('_');
  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [knowledgeElements, competence, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserId({ userId: authenticatedUserId }),
    competenceRepository.get(competenceId),
    competenceEvaluationRepository.findByUserId(authenticatedUserId),
  ]);

  const knowledgeElementsForCompetence = _.groupBy(knowledgeElements, 'competenceId')[competence.id];
  return Scorecard.buildFrom({ userId: authenticatedUserId, knowledgeElements: knowledgeElementsForCompetence, competence, competenceEvaluations });
};

