const _ = require('lodash');
const Scorecard = require('../models/Scorecard');

function _getStatus(knowledgeElements, competenceId, competenceEvaluations) {
  if (_.isEmpty(knowledgeElements)) {
    return 'NOT_STARTED';
  }

  const competenceEvaluationForCompetence = _.find(competenceEvaluations, { competenceId });
  const stateOfAssessment = _.get(competenceEvaluationForCompetence, 'assessment.state');
  if (stateOfAssessment === 'completed') {
    return 'COMPLETED';
  }
  return 'STARTED';
}

function createScorecard(userId, userKEList, competence, competenceEvaluations) {

  const sortedKEGroupedByCompetence = _.groupBy(userKEList, 'competenceId');
  const knowledgeElementsOfCompetence = sortedKEGroupedByCompetence[competence.id];
  const totalEarnedPixByCompetence = _.sumBy(knowledgeElementsOfCompetence, 'earnedPix');

  return new Scorecard({
    id: `${userId}_${competence.id}`,
    name: competence.name,
    description: competence.description,
    competenceId: competence.id,
    index: competence.index,
    area: competence.area,
    earnedPix: totalEarnedPixByCompetence,
    status: _getStatus(knowledgeElementsOfCompetence, competence.id, competenceEvaluations)
  });
}

module.exports = {
  createScorecard,
};
