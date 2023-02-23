const Scorecard = require('../models/Scorecard.js');
const { CompetenceResetError } = require('../errors.js');
const _ = require('lodash');

module.exports = async function resetScorecard({
  userId,
  competenceId,
  scorecardService,
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  assessmentRepository,
  campaignParticipationRepository,
  campaignRepository,
  locale,
}) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId,
    competenceId,
  });

  const nothingToReset = _.isEmpty(knowledgeElements);
  if (nothingToReset) {
    return null;
  }

  const remainingDaysBeforeReset = Scorecard.computeRemainingDaysBeforeReset(knowledgeElements);
  if (remainingDaysBeforeReset > 0) {
    throw new CompetenceResetError(remainingDaysBeforeReset);
  }

  const isCompetenceEvaluationExists = await competenceEvaluationRepository.existsByCompetenceIdAndUserId({
    competenceId,
    userId,
  });

  await scorecardService.resetScorecard({
    competenceId,
    userId,
    shouldResetCompetenceEvaluation: isCompetenceEvaluationExists,
    assessmentRepository,
    campaignParticipationRepository,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    campaignRepository,
  });

  return scorecardService.computeScorecard({
    userId,
    competenceId,
    competenceRepository,
    areaRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository,
    locale,
  });
};
