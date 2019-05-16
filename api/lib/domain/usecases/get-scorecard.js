const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, scorecardId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  const [userId, competenceId] = scorecardId.split('_');
  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competence, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserId({ userId: authenticatedUserId }),
    competenceRepository.get(competenceId),
    competenceEvaluationRepository.findByUserId(authenticatedUserId),
  ]);

  return Scorecard.buildFrom({ userId: authenticatedUserId, userKEList, competence, competenceEvaluations });
};

