const AssessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');

function getNextChallengeInAdaptiveCourse(answersPix, challengesPix) {
  const assessment = AssessmentAdapter.getAdaptedAssessment(answersPix, challengesPix);
  return assessment.nextChallenge ? assessment.nextChallenge.id : null;
}

module.exports = {
  getNextChallengeInAdaptiveCourse
};
