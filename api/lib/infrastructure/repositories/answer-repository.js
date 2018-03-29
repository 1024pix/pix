const Answer = require('../data/answer');

module.exports = {

  // TODO return domain object
  get(answerId) {
    return Answer.where('id', answerId).fetch();
  },

  // TODO return domain object
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
      .then(answers => answers.models.map((answer) => answer.toDomainEntity()));
  },

  // TODO return domain object
  findByChallenge(challengeId) {
    return Answer
      .where({ challengeId })
      .fetchAll()
      .then(answers => answers.models);
  },

  // TODO return domain object
  findCorrectAnswersByAssessment(assessmentId) {
    return Answer
      .where({ assessmentId, result: 'ok' })
      .fetchAll();
  }

};
