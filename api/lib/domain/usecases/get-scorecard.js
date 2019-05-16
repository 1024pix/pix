const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, scorecardId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository, scorecardService }) => {

  const [userId, competenceId] = scorecardId.split('_');
  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competence, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserId({ userId: authenticatedUserId }),
    competenceRepository.get(competenceId),
    competenceEvaluationRepository.findByUserId(authenticatedUserId),
  ]);

  return scorecardService.createScorecard(authenticatedUserId, userKEList, competence, competenceEvaluations);
};

