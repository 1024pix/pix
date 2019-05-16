const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, requestedUserId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository, scorecardService }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competenceTree, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserId({ userId: requestedUserId }),
    competenceRepository.list(),
    competenceEvaluationRepository.findByUserId(requestedUserId),
  ]);

  return _.map(competenceTree, (competence) =>
    scorecardService.createScorecard(requestedUserId, userKEList, competence, competenceEvaluations)
  );
};

