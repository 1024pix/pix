const Answer = require('../../domain/models/Answer');
const answerStatusDatabaseAdapter = require('../adapters/answer-status-database-adapter');
const BookshelfAnswer = require('../orm-models/Answer');
const BookshelfKnowledgeElement = require('../orm-models/KnowledgeElement');
const Bookshelf = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');
const jsYaml = require('js-yaml');
const _ = require('lodash');

function _adaptModelToDb(answer) {
  return {
    id: answer.id,
    result: answerStatusDatabaseAdapter.toSQLString(answer.result),
    resultDetails: jsYaml.dump(answer.resultDetails),
    value: answer.value,
    timeout: answer.timeout,
    challengeId: answer.challengeId,
    assessmentId: answer.assessmentId,
    timeSpent: answer.timeSpent,
  };
}

function _toDomain(bookshelfAnswer) {
  if (bookshelfAnswer) {
    return new Answer({
      id: bookshelfAnswer.get('id'),
      result: answerStatusDatabaseAdapter.fromSQLString(bookshelfAnswer.get('result')),
      resultDetails: bookshelfAnswer.get('resultDetails'),
      timeout: bookshelfAnswer.get('timeout'),
      value: bookshelfAnswer.get('value'),
      assessmentId: bookshelfAnswer.get('assessmentId'),
      challengeId: bookshelfAnswer.get('challengeId'),
      timeSpent: bookshelfAnswer.get('timeSpent'),
    });
  }
  return null;
}

function _toDomainFromKnex(answerDTO) {
  return new Answer({
    ...answerDTO,
    result: answerStatusDatabaseAdapter.fromSQLString(answerDTO.result),
  });
}

const FIELDS = Object.freeze(['id', 'result', 'resultDetails', 'timeout', 'value', 'assessmentId', 'challengeId', 'timeSpent']);

module.exports = {

  async get(id) {
    const answerDTO = await Bookshelf.knex
      .select(FIELDS)
      .from('answers')
      .where({ id })
      .first();

    if (!answerDTO) {
      throw new NotFoundError(`Not found answer for ID ${id}`);
    }

    return _toDomainFromKnex(answerDTO);
  },

  async findByIds(ids) {
    const answerDTOs = await Bookshelf.knex
      .select(FIELDS)
      .from('answers')
      .whereIn('id', ids)
      .orderBy('id');

    return answerDTOs.map((answerDTO) => _toDomainFromKnex(answerDTO));
  },

  async findByChallengeAndAssessment({ challengeId, assessmentId }) {
    const answerDTO = await Bookshelf.knex
      .select(FIELDS)
      .from('answers')
      .where({ challengeId, assessmentId })
      .first();

    if (!answerDTO) {
      return null;
    }

    return _toDomainFromKnex(answerDTO);
  },

  async findByAssessment(assessmentId) {
    const answerDTOs = await Bookshelf.knex
      .select(FIELDS)
      .from('answers')
      .where({ assessmentId })
      .orderBy('createdAt');

    return answerDTOs.map((answerDTO) => _toDomainFromKnex(answerDTO));
  },

  async findLastByAssessment(assessmentId) {
    const answerDTO = await Bookshelf.knex
      .select(FIELDS)
      .from('answers')
      .where({ assessmentId })
      .orderBy('createdAt', 'desc')
      .first();

    if (!answerDTO) {
      return null;
    }

    return _toDomainFromKnex(answerDTO);
  },

  async findChallengeIdsFromAnswerIds(ids) {
    const answerPartialDTOs = await Bookshelf.knex
      .select('challengeId')
      .from('answers')
      .whereIn('id', ids)
      .orderBy('challengeId');

    return _(answerPartialDTOs).map('challengeId').uniq().value();
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
  },
};
