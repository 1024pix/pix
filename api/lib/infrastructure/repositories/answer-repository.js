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
        .fetchAll()
        .then(resolve)
        .catch(reject);
    });
  }

};
