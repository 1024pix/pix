import _ from 'lodash';

import { Scorecard } from '../../../evaluation/domain/models/Scorecard.js';
import { constants } from '../../../shared/domain/constants.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { AttestationNotFoundError } from '../errors.js';

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

  const errorProbability = Math.random();
  if (errorProbability > 0.8) {
    throw new Error('unhandled error')
  }
  if (errorProbability > 0.6) {
    throw new AttestationNotFoundError();
  }
  logger.info('ERROR PROBABILITY', errorProbability);

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
