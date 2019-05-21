const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');
const _ = require('lodash');

module.exports = async ({ authenticatedUserId, scorecardId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [knowledgeElementsGroupedByCompetenceId, competence, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId: authenticatedUserId }),
    competenceRepository.get(competenceId),
    competenceEvaluationRepository.findByUserId(authenticatedUserId),
  ]);

  const knowledgeElements = knowledgeElementsGroupedByCompetenceId[competenceId];
  const competenceEvaluation = _.find(competenceEvaluations, { competenceId: competence.id });

  return Scorecard.buildFrom({
    userId: authenticatedUserId,
    knowledgeElements,
    competenceEvaluation,
    competence,
  });
};

