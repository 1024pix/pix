import _ from 'lodash';

import { Scorecard } from '../../../evaluation/domain/models/Scorecard.js';
import * as injectedCompetenceEvaluationRepository from '../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import { constants } from '../../../shared/domain/constants.js';
import * as injectedAreaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as injectedCompetenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as injectedKnowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';

const getUserProfile = async function ({
  userId,
  competenceRepository = injectedCompetenceRepository,
  areaRepository = injectedAreaRepository,
  competenceEvaluationRepository = injectedCompetenceEvaluationRepository,
  knowledgeElementRepository = injectedKnowledgeElementRepository,
  locale,
} = {}) {
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

export { getUserProfile };
