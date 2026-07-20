import { dump } from 'js-yaml';
import _ from 'lodash';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as answerStatusDatabaseAdapter from '../../../shared/infrastructure/adapters/answer-status-database-adapter.js';
import { ActivityAnswer } from '../../domain/models/ActivityAnswer.js';

function _adaptAnswerToDb(answer) {
  return {
    ..._.pick(answer, ['challengeId', 'activityId', 'value']),
    result: answerStatusDatabaseAdapter.toSQLString(answer.result),
    resultDetails: dump(answer.resultDetails),
  };
}

function _toDomain(answerDTO) {
  if (answerDTO === undefined) {
    return undefined;
  }
  return new ActivityAnswer({
    ...answerDTO,
    result: answerStatusDatabaseAdapter.fromSQLString(answerDTO.result),
  });
}

const COLUMNS = Object.freeze(['id', 'challengeId', 'activityId', 'value', 'result', 'resultDetails']);

const findLastByActivity = async function (activityId) {
  const knexConn = DomainTransaction.getConnection();
  const [lastAnswer] = await knexConn
    .select(COLUMNS)
    .from('activity-answers')
    .where({ activityId })
    .orderBy('createdAt', 'desc')
    .limit(1);
  return _toDomain(lastAnswer);
};

const save = async function (answer) {
  const knexConn = DomainTransaction.getConnection();
  const answerForDB = _adaptAnswerToDb(answer);
  const [savedAnswerDTO] = await knexConn('activity-answers').insert(answerForDB).returning(COLUMNS);
  return _toDomain(savedAnswerDTO);
};

export { findLastByActivity, save };
