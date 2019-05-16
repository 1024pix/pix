const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, requestedUserId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competenceTree, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserId({ userId: requestedUserId }),
    competenceRepository.list(),
    competenceEvaluationRepository.findByUserId(requestedUserId),
  ]);

  return _.map(competenceTree, (competence) =>
    Scorecard.buildFrom({ userId: requestedUserId, userKEList, competence, competenceEvaluations })
  );
};

