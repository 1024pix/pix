const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, scorecardId, smartPlacementKnowledgeElementRepository, competenceRepository }) => {

  const [userId, competenceId] = scorecardId.split('_');

  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competence] = await Promise.all([
    smartPlacementKnowledgeElementRepository.findUniqByUserId(authenticatedUserId),
    competenceRepository.get(competenceId),
  ]);

  const sortedKEGroupedByCompetence = _.groupBy(userKEList, 'competenceId');
  const knowledgeElementsOfCompetence = sortedKEGroupedByCompetence[competence.id];
  const totalEarnedPixByCompetence = _.sumBy(knowledgeElementsOfCompetence, 'earnedPix');

  return new Scorecard({
    id: scorecardId,
    name: competence.name,
    description: competence.description,
    index: competence.index,
    area: competence.area,
    earnedPix: totalEarnedPixByCompetence,
  });
};
