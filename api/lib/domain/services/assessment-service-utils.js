const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');

function getNextChallengeInAdaptiveCourse(answersPix, challengesPix, skills) {
  const assessment = assessmentAdapter.getAdaptedAssessment(answersPix, challengesPix, skills);
  return assessment.nextChallenge ? assessment.nextChallenge.id : null;
}

module.exports = {
  getNextChallengeInAdaptiveCourse
};
