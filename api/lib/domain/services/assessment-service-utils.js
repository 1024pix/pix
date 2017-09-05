const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');

function getNextChallengeInAdaptiveCourse(coursePix, answersPix, challengesPix, skillNames) {
  const assessment = assessmentAdapter.getAdaptedAssessment(coursePix, answersPix, challengesPix, skillNames);
  return assessment.nextChallenge ? assessment.nextChallenge.id : null;
}

module.exports = {
  getNextChallengeInAdaptiveCourse
};
