const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, requestedUserId, smartPlacementKnowledgeElementRepository, competenceRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competenceTree, competenceEvaluations] = await Promise.all([
    smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: requestedUserId, includeAssessments: false }),
    competenceRepository.list(),
    competenceEvaluationRepository.findByUserId(requestedUserId),
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
      status: _getStatus(KEgroup, competence.id, competenceEvaluations)
    };
  });
};

function _getStatus(knowledgeElements, competenceId, competenceEvaluation) {
  if (_.isEmpty(knowledgeElements)) {
    return 'NOT_STARTED';
  }

  const competenceEvaluationForCompetence = _.find(competenceEvaluation, { competenceId });
  const stateOfAssessment = _.get(competenceEvaluationForCompetence, 'assessment.state');
  if (stateOfAssessment === 'completed') {
    return 'COMPLETED';
  }
  return 'STARTED';

}
