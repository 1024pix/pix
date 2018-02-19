const Answer = require('../data/answer');

module.exports = {

  get(answerId) {
    return Answer.where('id', answerId).fetch();
  },

  findByChallengeAndAssessment(challengeId, assessmentId) {
    return Answer
      .where({ challengeId, assessmentId })
      .fetch();
  },

  findByAssessment(assessmentId) {
    return Answer
      .where({ assessmentId })
      .orderBy('createdAt')
      .fetchAll()
      .then(answers => answers.models);
  },

  findByChallenge(challengeId) {
    return Answer
      .where({ challengeId })
      .fetchAll()
      .then(answers => answers.models);
  },

  findCorrectAnswersByAssessment(assessmentId) {
    return Answer
      .where({ assessmentId, result: 'ok' })
      .fetchAll();
  }

};
