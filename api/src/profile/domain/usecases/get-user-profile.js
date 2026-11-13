import _ from 'lodash';

import { Scorecard } from '../../../evaluation/domain/models/Scorecard.js';
import { MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_SCORE } from '../../../shared/constants.js';

const getUserProfile = async function ({
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
  const areasById = new Map(allAreas.map((area) => [area.id, area]));

  const scorecards = _.map(competences, (competence) => {
    const competenceId = competence.id;
    const knowledgeElementsForCompetence = knowledgeElementsGroupedByCompetenceId[competenceId];
    const competenceEvaluation = _.find(competenceEvaluations, { competenceId });
    const area = areasById.get(competence.areaId);
    return Scorecard.buildFrom({
      userId,
      knowledgeElements: knowledgeElementsForCompetence,
      competence,
      area,
      competenceEvaluation,
    });
  });

  const pixScore = _.sumBy(scorecards, 'earnedPix');
  const maxReachableLevel = MAX_REACHABLE_LEVEL;
  const maxReachablePixScore = MAX_REACHABLE_PIX_SCORE;

  return {
    id: userId,
    pixScore,
    scorecards,
    maxReachablePixScore,
    maxReachableLevel,
  };
};

export { getUserProfile };
