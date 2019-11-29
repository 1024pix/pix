const fp = require('lodash/fp');
const jsYaml = require('js-yaml');

const createCommonRepositoryMethods = require('../createCommonRepositoryMethods');
const Answer = require('../../domain/models/Answer');
const Bookshelf = require('../bookshelf');
const BookshelfAnswer = require('../data/answer');
const answerStatusDatabaseAdapter = require('../adapters/answer-status-database-adapter');

const { get, findOneByAttributes, findByAttributes, create } = createCommonRepositoryMethods({
  BookshelfModel: BookshelfAnswer,
  toDomain: _toDomain,
  adaptToDatabaseForCreate: _adaptModelToDb,
});

const methods = {

  get,

  findByChallengeAndAssessment({ challengeId, assessmentId }) {
    return findOneByAttributes({ challengeId, assessmentId });
  },

  findByAssessment(assessmentId) {
    return findByAttributes({ assessmentId });
  },

  findByChallenge(challengeId) {
    return findByAttributes({ challengeId });
  },

  findChallengeIdsFromAnswerIds(answerIds) {
    return Bookshelf.knex('answers')
      .distinct('challengeId')
      .whereIn('id', answerIds)
      .then(fp.map('challengeId'));
  },

  findCorrectAnswersByAssessmentId(assessmentId) {
    return findByAttributes({ assessmentId, result: 'ok' });
  },

  save: create,
};

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
    });
  }
  return null;
}

module.exports = methods;
