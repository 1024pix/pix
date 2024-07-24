import jsYaml from 'js-yaml';
import _ from 'lodash';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as answerStatusDatabaseAdapter from '../../../shared/infrastructure/adapters/answer-status-database-adapter.js';
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
  const knexConn = DomainTransaction.getConnection();
  const answerDTOs = await knexConn.select(COLUMNS).from('activity-answers').where({ activityId }).orderBy('createdAt');
  return _toDomainArray(answerDTOs);
};

const save = async function (answer) {
  const knexConn = DomainTransaction.getConnection();
  const answerForDB = _adaptAnswerToDb(answer);
  const [savedAnswerDTO] = await knexConn('activity-answers').insert(answerForDB).returning(COLUMNS);
  return _toDomain(savedAnswerDTO);
};

export { findByActivity, save };
