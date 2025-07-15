import { AssessmentEndedError, UserNotAuthorizedToAccessEntityError } from '../../../shared/domain/errors.js';

const getNextChallengeForCompetenceEvaluation = async function ({
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
  }).id;
};

export { getNextChallengeForCompetenceEvaluation };

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
