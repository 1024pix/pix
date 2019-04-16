const _ = require('lodash');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, scorecardId, smartPlacementKnowledgeElementRepository, competenceRepository }) => {

  const [userKEList, competence] = await Promise.all([
    smartPlacementKnowledgeElementRepository.findUniqByUserId(authenticatedUserId),
    competenceRepository.get(scorecardId),
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
