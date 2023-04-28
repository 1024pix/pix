const { AssessmentEndedError, UserNotAuthorizedToAccessEntityError } = require('../errors.js');

const dataFetcher = require('../services/algorithm-methods/data-fetcher.js');

module.exports = async function getNextChallengeForCompetenceEvaluation({
  pickChallengeService,
  assessment,
  userId,
  locale,
  smartRandom,
}) {
  _checkIfAssessmentBelongsToUser(assessment, userId);
  const inputValues = await dataFetcher.fetchForCompetenceEvaluations(...arguments);

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

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
