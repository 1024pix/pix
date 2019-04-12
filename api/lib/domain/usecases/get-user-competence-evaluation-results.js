const _ = require('lodash');
const CompetenceEvaluationResult = require('../models/CompetenceEvaluationResult');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

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

    return new CompetenceEvaluationResult({
      id: `${requestedUserId}_${competence.index}`,
      name: competence.name,
      index: competence.index,
      area: competence.area,
      courseId: competence.courseId,
      earnedPix: totalEarnedPixByCompetence,
    });
  });
};
