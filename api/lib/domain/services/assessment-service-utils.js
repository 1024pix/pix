const assessmentAdapter = require('../../infrastructure/adapters/assessment-adapter');
const _ = require('lodash');

module.exports = {

  getNextChallengeInAdaptiveCourse(answersPix, challengesPix, skills) {
    const assessment = assessmentAdapter.getAdaptedAssessment(answersPix, challengesPix, skills);
    return _.get(assessment, 'nextChallenge.id', null);
  }

};
