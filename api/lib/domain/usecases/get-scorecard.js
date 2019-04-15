const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, scorecardId, smartPlacementKnowledgeElementRepository, competenceRepository }) => {

  const scorecardIdArray = scorecardId.split('_');
  const requestedUserId = parseInt(scorecardIdArray[0]);
  const competenceId = scorecardIdArray[1];
  const authenticatedUserIdInt = parseInt(authenticatedUserId);
  
  if (authenticatedUserIdInt !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competence] = await Promise.all([
    smartPlacementKnowledgeElementRepository.findUniqByUserId(requestedUserId),
    competenceRepository.get(competenceId),
  ]);

  const sortedKEGroupedByCompetence = _.groupBy(userKEList, 'competenceId');
  const KEgroup = sortedKEGroupedByCompetence[competence.id];
  const totalEarnedPixByCompetence = _.sumBy(KEgroup, 'earnedPix');

  return new Scorecard({
    id: scorecardId,
    name: competence.name,
    index: competence.index,
    area: competence.area,
    courseId: competence.courseId,
    earnedPix: totalEarnedPixByCompetence,
  });
};
