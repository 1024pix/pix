import { AssessmentEndedError, UserNotAuthorizedToAccessEntityError } from '../../../shared/domain/errors.js';
import * as injectedAlgorithmDataFetcherService from '../services/algorithm-methods/data-fetcher.js';
import * as injectedSmartRandomService from '../services/algorithm-methods/smart-random.js';
import { pickChallengeService as injectedPickChallengeService } from '../services/pick-challenge-service.js';

const getNextChallengeForCompetenceEvaluation = async function ({
  assessment,
  userId,
  locale,
  pickChallengeService = injectedPickChallengeService,
  smartRandomService = injectedSmartRandomService,
  algorithmDataFetcherService = injectedAlgorithmDataFetcherService,
} = {}) {
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
};

export { getNextChallengeForCompetenceEvaluation };

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
