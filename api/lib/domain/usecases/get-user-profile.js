const Scorecard = require('../models/Scorecard.js');
const constants = require('../constants.js');
const _ = require('lodash');

module.exports = async function getUserProfile({
  userId,
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  locale,
}) {
  const [knowledgeElementsGroupedByCompetenceId, competences, competenceEvaluations] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({ userId }),
    competenceRepository.listPixCompetencesOnly({ locale }),
    competenceEvaluationRepository.findByUserId(userId),
  ]);
  const allAreas = await areaRepository.list({ locale });

  const scorecards = _.map(competences, (competence) => {
    const competenceId = competence.id;
    const knowledgeElementsForCompetence = knowledgeElementsGroupedByCompetenceId[competenceId];
    const competenceEvaluation = _.find(competenceEvaluations, { competenceId });
    const area = allAreas.find((area) => area.id === competence.areaId);
    return Scorecard.buildFrom({
      userId,
      knowledgeElements: knowledgeElementsForCompetence,
      competence,
      area,
      competenceEvaluation,
    });
  });

  const pixScore = _.sumBy(scorecards, 'earnedPix');
  const maxReachableLevel = constants.MAX_REACHABLE_LEVEL;
  const maxReachablePixScore = constants.MAX_REACHABLE_PIX_SCORE;

  return {
    id: userId,
    pixScore,
    scorecards,
    maxReachablePixScore,
    maxReachableLevel,
  };
};
