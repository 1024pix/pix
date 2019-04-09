const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

const MAX_REACHABLE_LEVEL = 5;
const NB_PIX_BY_LEVEL = 8;

module.exports = async ({ authenticatedUserId, requestedUserId, smartPlacementKnowledgeElementRepository, competenceRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competenceTree] = await Promise.all([
    smartPlacementKnowledgeElementRepository.findUniqByUserId(requestedUserId),
    competenceRepository.list(),
  ]);

  const sortedKEGroupedByCompetence = _.groupBy(userKEList, 'competenceId');

  return _.map(competenceTree, (competence) => {
    const KEgroup = sortedKEGroupedByCompetence[competence.id];
    const totalEarnedPixByCompetence = _.sumBy(KEgroup, 'earnedPix');

    return new Scorecard({
      id: `${authenticatedUserId}_${competence.id}`,
      name: competence.name,
      description: competence.description,
      index: competence.index,
      area: competence.area,
      competenceId: competence.id,
      earnedPix: totalEarnedPixByCompetence,
    });
  });
};
