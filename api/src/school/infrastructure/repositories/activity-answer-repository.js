import _ from 'lodash';
import jsYaml from 'js-yaml';
import { knex } from '../../../../db/knex-database-connection.js';
import * as answerStatusDatabaseAdapter from '../adapters/answer-status-database-adapter.js';
import { ActivityAnswer } from '../../domain/models/ActivityAnswer.js';

function _adaptAnswerToDb(answer) {
  return {
    ..._.pick(answer, ['challengeId', 'activityId', 'value']),
    result: answerStatusDatabaseAdapter.toSQLString(answer.result),
    resultDetails: jsYaml.dump(answer.resultDetails),
  };
}

function _toDomain(answerDTO) {
  return new ActivityAnswer({
    ...answerDTO,
    result: answerStatusDatabaseAdapter.fromSQLString(answerDTO.result),
  });
}

function _toDomainArray(answerDTOs) {
  return _.map(answerDTOs, _toDomain);
}

const COLUMNS = Object.freeze(['id', 'challengeId', 'activityId', 'value', 'result', 'resultDetails']);

const findByActivity = async function (activityId) {
  const answerDTOs = await knex.select(COLUMNS).from('activity-answers').where({ activityId }).orderBy('createdAt');
  return _toDomainArray(answerDTOs);
};

const save = async function (answer) {
  const answerForDB = _adaptAnswerToDb(answer);
  return knex.transaction(async (trx) => {
    const [savedAnswerDTO] = await trx('activity-answers').insert(answerForDB).returning(COLUMNS);
    return _toDomain(savedAnswerDTO);
  });
};

export { findByActivity, save };
