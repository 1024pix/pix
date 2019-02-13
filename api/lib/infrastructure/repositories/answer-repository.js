const Answer = require('../../domain/models/Answer');
const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');
const answerStatusDatabaseAdapter = require('../adapters/answer-status-database-adapter');
const BookshelfAnswer = require('../data/answer');
const jsYaml = require('js-yaml');
const { NotFoundError } = require('../../domain/errors');

function _adaptModelToDb(answer) {
  return {
    id: answer.id,
    result: answerStatusDatabaseAdapter.toSQLString(answer.result),
    resultDetails: jsYaml.safeDump(answer.resultDetails),
    value: answer.value,
    timeout: answer.timeout,
    elapsedTime: answer.elapsedTime,
    challengeId: answer.challengeId,
    assessmentId: answer.assessmentId,
  };
}

function _toDomain(bookshelfAnswer) {
  if (bookshelfAnswer) {
    return new Answer({
      id: bookshelfAnswer.get('id'),
      elapsedTime: bookshelfAnswer.get('elapsedTime'),
      result: answerStatusDatabaseAdapter.fromSQLString(bookshelfAnswer.get('result')),
      resultDetails: bookshelfAnswer.get('resultDetails'),
      timeout: bookshelfAnswer.get('timeout'),
      value: bookshelfAnswer.get('value'),
      assessmentId: bookshelfAnswer.get('assessmentId'),
      challengeId: bookshelfAnswer.get('challengeId'),
      knowledgeElements: bookshelfAnswer.related('knowledgeElements').map((ke)=> new SmartPlacementKnowledgeElement(ke.toJSON()))
    });
  }
  return null;
}

module.exports = {

  get(answerId) {
    return BookshelfAnswer.where('id', answerId)
      .fetch({
        withRelated: ['knowledgeElements'],
        require: true
      })
      .then(_toDomain)
      .catch((err) => {
        if (err instanceof BookshelfAnswer.NotFoundError) {
          throw new NotFoundError(`Not found answer for ID ${answerId}`);
        } else {
          throw err;
        }
      });
  },

  getByChallengeAndAssessment({ challengeId, assessmentId }) {
    return BookshelfAnswer
      .where({ challengeId, assessmentId })
      .fetch()
      .then(_toDomain);
  },

  findByAssessment(assessmentId) {
    return BookshelfAnswer
      .where({ assessmentId })
      .orderBy('createdAt')
      .fetchAll()
      .then((answers) => answers.models.map(_toDomain));
  },

  findByChallenge(challengeId) {
    return BookshelfAnswer
      .where({ challengeId })
      .fetchAll()
      .then((answers) => answers.models.map(_toDomain));
  },

  findCorrectAnswersByAssessment(assessmentId) {
    return BookshelfAnswer
      .where({ assessmentId, result: 'ok' })
      .fetchAll()
      .then((answers) => answers.models.map(_toDomain));
  },

  save(answer) {
    return Promise.resolve(answer)
      .then(_adaptModelToDb)
      .then((rawDBAnswerModel) => new BookshelfAnswer(rawDBAnswerModel))
      .then((answerBookshelf) => answerBookshelf.save())
      .then(_toDomain);
  },
};
