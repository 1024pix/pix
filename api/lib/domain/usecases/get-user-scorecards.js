const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, requestedUserId, smartPlacementKnowledgeElementRepository, competenceRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competenceTree] = await Promise.all([
    smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: requestedUserId, includeAssessments: true }),
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
      status: _getStatus(KEgroup)

    });
  });
};

function _getStatus(knowledgeElements) {
  if (_.isEmpty(knowledgeElements)) {
    return 'NOT_STARTED';
  }

  const someCompetenceEvaluationsStarted = _.some(knowledgeElements, { 'type': 'COMPETENCE_EVALUATION', 'state': 'started' });

  if (someCompetenceEvaluationsStarted) {
    return 'STARTED';
  }

  return 'COMPLETED';
}
