const _ = require('lodash');
const Scorecard = require('../models/Scorecard');

module.exports = async function getUserScorecards({ userId, knowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) {
  const [knowledgeElementsGroupedByCompetenceId, competencesWithArea, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId }),
    competenceRepository.listPixCompetencesOnly(),
    competenceEvaluationRepository.findByUserId(userId),
  ]);

  return _.map(competencesWithArea, (competence) => {
    const competenceId = competence.id;
    const knowledgeElementsForCompetence = knowledgeElementsGroupedByCompetenceId[competenceId];
    const competenceEvaluation = _.find(competenceEvaluations, { competenceId });

    return Scorecard.buildFrom({
      userId,
      knowledgeElements: knowledgeElementsForCompetence,
      competence,
      competenceEvaluation
    });
  });
};

