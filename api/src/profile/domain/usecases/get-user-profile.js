import _ from 'lodash';

import { Scorecard } from '../../../evaluation/domain/models/Scorecard.js';
import { MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_SCORE } from '../../../shared/constants.js';

const getUserProfile = async function ({
  userId,
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeStateRepository,
  locale,
}) {
  const [knowledgeState, competences, competenceEvaluations] = await Promise.all([
    knowledgeStateRepository.findByUserId({ userId }),
    competenceRepository.listPixCompetencesOnly({ locale }),
    competenceEvaluationRepository.findByUserId(userId),
  ]);
  const allAreas = await areaRepository.list({ locale });

  const scorecards = _.map(competences, (competence) => {
    const competenceId = competence.id;
    const competenceEvaluation = _.find(competenceEvaluations, { competenceId });
    const area = allAreas.find((area) => area.id === competence.areaId);
    return Scorecard.buildFrom({
      userId,
      knowledgeState: knowledgeState.restrictedToCompetence(competenceId),
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
