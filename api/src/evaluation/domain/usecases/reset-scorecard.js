import { CompetenceResetError } from '../errors.js';
import { Scorecard } from '../models/Scorecard.js';

const resetScorecard = async function ({
  userId,
  competenceId,
  scorecardService,
  competenceRepository,
  areaRepository,
  competenceEvaluationRepository,
  knowledgeStateRepository,
  assessmentRepository,
  campaignParticipationRepository,
  campaignRepository,
  locale,
}) {
  const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });
  const competenceState = knowledgeState.restrictedToCompetence(competenceId);

  const nothingToReset = competenceState.isEmpty;
  if (nothingToReset) {
    return null;
  }

  const remainingDaysBeforeReset = Scorecard.computeRemainingDaysBeforeReset(competenceState);
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
    knowledgeStateRepository,
    campaignRepository,
  });

  return scorecardService.computeScorecard({
    userId,
    competenceId,
    competenceRepository,
    areaRepository,
    competenceEvaluationRepository,
    knowledgeStateRepository,
    locale,
  });
};

export { resetScorecard };
