const fp = require('lodash/fp');
const Answer = require('../../domain/models/Answer');
const answerStatusDatabaseAdapter = require('../adapters/answer-status-database-adapter');
const BookshelfAnswer = require('../data/answer');
const BookshelfKnowledgeElement = require('../data/knowledge-element');

const Bookshelf = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');
const jsYaml = require('js-yaml');
const _ = require('lodash');

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

module.exports = {

  get(answerId) {
    return BookshelfAnswer.where('id', answerId)
      .fetch({ require: true })
      .then(_toDomain)
      .catch((error) => {
        if (error instanceof BookshelfAnswer.NotFoundError) {
          throw new NotFoundError(`Not found answer for ID ${answerId}`);
        }

        throw error;
      });
  },

  findByChallengeAndAssessment({ challengeId, assessmentId }) {
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

  findLastByAssessment(assessmentId) {
    return BookshelfAnswer
      .where({ assessmentId })
      .orderBy('createdAt', 'desc')
      .fetch()
      .then(_toDomain);
  },

  findChallengeIdsFromAnswerIds(answerIds) {
    return Bookshelf.knex('answers')
      .distinct('challengeId')
      .whereIn('id', answerIds)
      .then(fp.map('challengeId'));
  },

  findCorrectAnswersByAssessmentId(assessmentId) {
    return BookshelfAnswer
      .where({ assessmentId, result: 'ok' })
      .fetchAll()
      .then((answers) => answers.models.map(_toDomain));
  },

  async saveWithKnowledgeElements(answer, knowledgeElements) {
    const answerForDB = _adaptModelToDb(answer);

    return Bookshelf.transaction(async (transacting) => {
      const answerSaved = await new BookshelfAnswer(answerForDB)
        .save(null, { require: true, method: 'insert', transacting });
      knowledgeElements.map((knowledgeElement) => knowledgeElement.answerId = answerSaved.id);
      await Promise.all(knowledgeElements.map(async (knowledgeElement) => {
        const knowledgeElementBookshelf = await new BookshelfKnowledgeElement(_.omit(knowledgeElement, ['id', 'createdAt']));
        await knowledgeElementBookshelf.save(null, { transacting });
      }));

      return _toDomain(answerSaved);
    });
  }
};
