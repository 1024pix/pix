const BookshelfAnswer = require('../data/answer');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  get(answerId) {
    return BookshelfAnswer.where('id', answerId)
      .fetch({ require: true })
      .then(answer => answer.toDomainEntity())
      .catch(err => {
        if (err instanceof BookshelfAnswer.NotFoundError) {
          throw new NotFoundError(`Not found answer for ID ${answerId}`);
        } else {
          throw err;
        }
      });
  },

  // TODO return domain object
  findByChallengeAndAssessment(challengeId, assessmentId) {
    return BookshelfAnswer
      .where({ challengeId, assessmentId })
      .fetch();
  },

  findByAssessment(assessmentId) {
    return BookshelfAnswer
      .where({ assessmentId })
      .orderBy('createdAt')
      .fetchAll()
      .then(answers => answers.models.map((answer) => answer.toDomainEntity()));
  },

  // TODO return domain object
  findByChallenge(challengeId) {
    return BookshelfAnswer
      .where({ challengeId })
      .fetchAll()
      .then(answers => answers.models);
  },

  // TODO return domain object
  findCorrectAnswersByAssessment(assessmentId) {
    return BookshelfAnswer
      .where({ assessmentId, result: 'ok' })
      .fetchAll();
  }

};
