import { AssessmentEndedError, UserNotAuthorizedToAccessEntityError } from '../../../shared/domain/errors.js';

export async function getNextChallengeForCompetenceEvaluation({
  assessment,
  userId,
  locale,
  pickChallengeService,
  smartRandomService,
  algorithmDataFetcherService,
}) {
  _checkIfAssessmentBelongsToUser(assessment, userId);
  const inputValues = await algorithmDataFetcherService.fetchForCompetenceEvaluations(...arguments);

  const { possibleSkillsForNextChallenge, hasAssessmentEnded } = smartRandomService.getPossibleSkillsForNextChallenge({
    ...inputValues,
    locale,
  });

  if (hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  return pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale: locale,
  });
}

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
