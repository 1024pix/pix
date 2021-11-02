module.exports = { getPossibleNextChallenges };

function getPossibleNextChallenges({ challenges } = {}) {
  return {
    hasAssessmentEnded: false,
    possibleChallenges: [challenges[0]],
  };
}
