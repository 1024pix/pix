const _ = require('lodash');
const jsYaml = require('js-yaml');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const Answer = require('../../domain/models/Answer');
const answerStatusDatabaseAdapter = require('../adapters/answer-status-database-adapter');

function _adaptAnswerToDb(answer) {
  return {
    ...(_.pick(answer, ['value', 'timeout', 'challengeId', 'assessmentId', 'timeSpent'])),
    result: answerStatusDatabaseAdapter.toSQLString(answer.result),
    resultDetails: jsYaml.dump(answer.resultDetails),
  };
}

function _adaptKnowledgeElementToDb(knowledgeElement) {
  return _.pick(knowledgeElement, ['source', 'status', 'earnedPix',
    'answerId', 'assessmentId', 'skillId', 'userId', 'competenceId']);
}

function _toDomain(answerDTO) {
  return new Answer({
    ...answerDTO,
    result: answerStatusDatabaseAdapter.fromSQLString(answerDTO.result),
  });
}

function _toDomainArray(answerDTOs) {
  return _.map(answerDTOs, _toDomain);
}

const COLUMNS = Object.freeze(['id', 'result', 'resultDetails', 'timeout', 'value', 'assessmentId', 'challengeId', 'timeSpent']);

module.exports = {

  async get(id) {
    const answerDTO = await knex
      .select(COLUMNS)
      .from('answers')
      .where({ id })
      .first();

    if (!answerDTO) {
      throw new NotFoundError(`Not found answer for ID ${id}`);
    }

    return _toDomain(answerDTO);
  },

  async findByIds(ids) {
    const answerDTOs = await knex
      .select(COLUMNS)
      .from('answers')
      .whereInArray('id', ids)
      .orderBy('id');

    return _toDomainArray(answerDTOs);
  },

  async findByChallengeAndAssessment({ challengeId, assessmentId }) {
    const answerDTO = await knex
      .select(COLUMNS)
      .from('answers')
      .where({ challengeId, assessmentId })
      .orderBy('createdAt', 'desc')
      .first();

    if (!answerDTO) {
      return null;
    }

    return _toDomain(answerDTO);
  },

  async findByAssessment(assessmentId) {
    const answerDTOs = await knex
      .select(COLUMNS)
      .from('answers')
      .where({ assessmentId })
      .orderBy('createdAt');

    return _toDomainArray(answerDTOs);
  },

  async findLastByAssessment(assessmentId) {
    const answerDTO = await knex
      .select(COLUMNS)
      .from('answers')
      .where({ assessmentId })
      .orderBy('createdAt', 'desc')
      .first();

    if (!answerDTO) {
      return null;
    }

    return _toDomain(answerDTO);
  },

  async findChallengeIdsFromAnswerIds(ids) {
    return knex
      .distinct()
      .pluck('challengeId')
      .from('answers')
      .whereInArray('id', ids);
  },

  async saveWithKnowledgeElements(answer, knowledgeElements) {
    const answerForDB = _adaptAnswerToDb(answer);
    const trx = await knex.transaction();
    try {
      const [savedAnswerDTO] = await trx('answers').insert(answerForDB, COLUMNS);
      const savedAnswer = _toDomain(savedAnswerDTO);
      for (const knowledgeElement of knowledgeElements) {
        knowledgeElement.answerId = savedAnswer.id;
        const knowledgeElementForDB = _adaptKnowledgeElementToDb(knowledgeElement);
        await trx('knowledge-elements').insert(knowledgeElementForDB);
      }
      await trx.commit();
      return savedAnswer;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },
};
