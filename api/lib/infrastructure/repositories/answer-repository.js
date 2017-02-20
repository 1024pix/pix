const Answer = require('../../domain/models/data/answer');

module.exports = {

  findByChallengeAndAssessment(challengeId, assessmentId) {

    return Promise.resolve(
      Answer
        .where({ challengeId, assessmentId })
        .fetch()
    );
  },

  findByAssessment(assessmentId) {

    return new Promise((resolve, reject) => {
      Answer
        .where({ assessmentId })
        .orderBy('createdAt')
        .fetchAll()
        .then(resolve)
        .catch(reject);
    });
  },

  findByChallenge(challengeId) {

    return new Promise((resolve, reject) => {
      return Answer
        .where({ challengeId })
        .fetchAll()
        .then((answers) => resolve(answers.models))
        .catch(reject);
    });
  }

};
