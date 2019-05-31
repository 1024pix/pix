const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');
const _ = require('lodash');

module.exports = async ({ authenticatedUserId, scorecardId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [knowledgeElements, competence, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId: authenticatedUserId, competenceId }),
    competenceRepository.get(competenceId),
    competenceEvaluationRepository.findByUserId(authenticatedUserId),
  ]);

  const competenceEvaluation = _.find(competenceEvaluations, { competenceId: competence.id });

  return Scorecard.buildFrom({
    userId: authenticatedUserId,
    knowledgeElements,
    competenceEvaluation,
    competence,
  });
};

