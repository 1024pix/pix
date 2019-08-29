const Scorecard = require('../models/Scorecard');
const { CompetenceResetError } = require('../errors');
const _ = require('lodash');

module.exports = async function resetScorecard({
  userId,
  competenceId,
  scorecardService,
  competenceRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  assessmentRepository,
  campaignParticipationRepository,
}) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId,
    competenceId
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
    userId
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
  });

  return scorecardService.computeScorecard({
    userId,
    competenceId,
    competenceRepository,
    competenceEvaluationRepository,
    knowledgeElementRepository
  });
};
