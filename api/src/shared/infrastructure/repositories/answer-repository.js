import { dump } from 'js-yaml';

import { Answer } from '../../../evaluation/domain/models/Answer.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { NotFoundError } from '../../domain/errors.js';
import * as answerStatusDatabaseAdapter from '../adapters/answer-status-database-adapter.js';

const COLUMNS = Object.freeze([
  'id',
  'result',
  'resultDetails',
  'timeout',
  'value',
  'assessmentId',
  'challengeId',
  'timeSpent',
  'createdAt',
]);

export async function get(id) {
  const knexConn = DomainTransaction.getConnection();
  const answerDTO = await knexConn.select(COLUMNS).from('answers').where({ id }).first();

  if (!answerDTO) {
    throw new NotFoundError(`Not found answer for ID ${id}`);
  }

  return _toDomain(answerDTO);
}

export async function findByChallengeAndAssessment({ challengeId, assessmentId }) {
  const knexConn = DomainTransaction.getConnection();
  const answerDTO = await knexConn
    .select(COLUMNS)
    .from('answers')
    .where({ challengeId, assessmentId })
    .orderBy('createdAt', 'asc')
    .first();

  if (!answerDTO) {
    return null;
  }

  return _toDomain(answerDTO);
}

/**
 * Finds all answers for a given assessment, unique by challengeId (keeping the oldest one), ordered by creation date.
 *
 * @param {number} assessmentId
 * @returns {Promise<Answer[]>}
 */
export async function findByAssessment(assessmentId) {
  const knexConn = DomainTransaction.getConnection();
  const answerDTOs = await knexConn.select(COLUMNS).from('answers').where({ assessmentId }).orderBy('createdAt', 'asc');
  const dedupedAnswerDTOs = uniqByChallenge(answerDTOs);
  return _toDomainArray(dedupedAnswerDTOs);
}

export async function save({ answer }) {
  const knexConn = DomainTransaction.getConnection();
  const answerForDB = _adaptAnswerToDb(answer);
  const [savedAnswerDTO] = await knexConn('answers').insert(answerForDB).returning(COLUMNS);
  return _toDomain(savedAnswerDTO);
}

function uniqByChallenge(answerDTOs) {
  const map = new Map();

  for (const a of answerDTOs) {
    if (!map.has(a.challengeId)) {
      map.set(a.challengeId, a);
    }
  }

  return [...map.values()];
}

function _adaptAnswerToDb(answer) {
  return {
    value: answer.value,
    timeout: answer.timeout,
    challengeId: answer.challengeId,
    assessmentId: answer.assessmentId,
    timeSpent: answer.timeSpent,
    isFocusedOut: answer.isFocusedOut,
    result: answerStatusDatabaseAdapter.toSQLString(answer.result),
    resultDetails: dump(answer.resultDetails),
  };
}

function _toDomain(answerDTO) {
  return new Answer({
    ...answerDTO,
    result: answerStatusDatabaseAdapter.fromSQLString(answerDTO.result),
  });
}

function _toDomainArray(answerDTOs) {
  return answerDTOs.map(_toDomain);
}
