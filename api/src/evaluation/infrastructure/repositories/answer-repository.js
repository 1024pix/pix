import _ from 'lodash';
import jsYaml from 'js-yaml';
import { knex } from '../../../../db/knex-database-connection.js';
import { ChallengeAlreadyAnsweredError, NotFoundError } from '../../../../lib/domain/errors.js';
import { Answer } from '../../domain/models/Answer.js';
import * as answerStatusDatabaseAdapter from '../../../../src/school/infrastructure/adapters/answer-status-database-adapter.js';

function _adaptAnswerToDb(answer) {
  return {
    ..._.pick(answer, ['value', 'timeout', 'challengeId', 'assessmentId', 'timeSpent', 'isFocusedOut']),
    result: answerStatusDatabaseAdapter.toSQLString(answer.result),
    resultDetails: jsYaml.dump(answer.resultDetails),
  };
}

function _adaptKnowledgeElementToDb(knowledgeElement) {
  return _.pick(knowledgeElement, [
    'source',
    'status',
    'earnedPix',
    'answerId',
    'assessmentId',
    'skillId',
    'userId',
    'competenceId',
  ]);
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

const COLUMNS = Object.freeze([
  'id',
  'result',
  'resultDetails',
  'timeout',
  'value',
  'assessmentId',
  'challengeId',
  'timeSpent',
]);

const get = async function (id) {
  const answerDTO = await knex.select(COLUMNS).from('answers').where({ id }).first();

  if (!answerDTO) {
    throw new NotFoundError(`Not found answer for ID ${id}`);
  }

  return _toDomain(answerDTO);
};

const findByChallengeAndAssessment = async function ({ challengeId, assessmentId }) {
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
};

const findByAssessment = async function (assessmentId) {
  const answerDTOs = await knex.select(COLUMNS).from('answers').where({ assessmentId }).orderBy('createdAt');
  const answerDTOsWithoutDuplicate = _.uniqBy(answerDTOs, 'challengeId');

  return _toDomainArray(answerDTOsWithoutDuplicate);
};

const findChallengeIdsFromAnswerIds = async function (ids) {
  return knex.distinct().pluck('challengeId').from('answers').whereInArray('id', ids);
};

const saveWithKnowledgeElements = async function (answer, knowledgeElements) {
  const answerForDB = _adaptAnswerToDb(answer);
  return knex.transaction(async (trx) => {
    const alreadySavedAnswer = await trx('answers')
      .select('id')
      .where({ challengeId: answer.challengeId, assessmentId: answer.assessmentId });
    if (alreadySavedAnswer.length !== 0) {
      throw new ChallengeAlreadyAnsweredError();
    }
    const [savedAnswerDTO] = await trx('answers').insert(answerForDB).returning(COLUMNS);
    const savedAnswer = _toDomain(savedAnswerDTO);
    if (!_.isEmpty(knowledgeElements)) {
      for (const knowledgeElement of knowledgeElements) {
        knowledgeElement.answerId = savedAnswer.id;
      }
      const knowledgeElementsForDB = knowledgeElements.map(_adaptKnowledgeElementToDb);
      await trx('knowledge-elements').insert(knowledgeElementsForDB);
    }
    return savedAnswer;
  });
};
export {
  get,
  findByChallengeAndAssessment,
  findByAssessment,
  findChallengeIdsFromAnswerIds,
  saveWithKnowledgeElements,
};
