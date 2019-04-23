const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');

module.exports = async ({ authenticatedUserId, scorecardId, smartPlacementKnowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  const [userId, competenceId] = scorecardId.split('_');
  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competence, competenceEvaluations] = await Promise.all([
    smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: authenticatedUserId }),
    competenceRepository.get(competenceId),
    competenceEvaluationRepository.findByUserId(authenticatedUserId),
  ]);

  const sortedKEGroupedByCompetence = _.groupBy(userKEList, 'competenceId');
  const knowledgeElementsOfCompetence = sortedKEGroupedByCompetence[competence.id];
  const totalEarnedPixByCompetence = _.sumBy(knowledgeElementsOfCompetence, 'earnedPix');

  return new Scorecard({
    id: scorecardId,
    name: competence.name,
    description: competence.description,
    competenceId: competence.id,
    index: competence.index,
    area: competence.area,
    earnedPix: totalEarnedPixByCompetence,
    status: _getStatus(knowledgeElementsOfCompetence, competence.id, competenceEvaluations)
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
