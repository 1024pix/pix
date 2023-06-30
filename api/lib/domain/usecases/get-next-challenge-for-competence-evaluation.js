import { AssessmentEndedError, UserNotAuthorizedToAccessEntityError } from '../../../src/shared/domain/errors.js';
import * as algorithmDataFetcherService from '../services/algorithm-methods/data-fetcher.js';

const getNextChallengeForCompetenceEvaluation = async function ({
  pickChallengeService,
  assessment,
  userId,
  locale,
  smartRandom,
}) {
  _checkIfAssessmentBelongsToUser(assessment, userId);
  const inputValues = await algorithmDataFetcherService.fetchForCompetenceEvaluations(...arguments);

  const { possibleSkillsForNextChallenge, hasAssessmentEnded } = smartRandom.getPossibleSkillsForNextChallenge({
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
};

export { getNextChallengeForCompetenceEvaluation };

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
