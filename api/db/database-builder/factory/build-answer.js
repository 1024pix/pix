import buildAssessment from './build-assessment';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildAnswer({
  id = databaseBuffer.getNextId(),
  value = 'Some value for answer',
  result = 'Some result for answer',
  assessmentId,
  challengeId = 'rec123ABC',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  timeout = null,
  resultDetails = 'Some result details for answer.',
  timeSpent = 30,
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment().id : assessmentId;

  const values = {
    id,
    value,
    result,
    assessmentId,
    challengeId,
    createdAt,
    updatedAt,
    timeout,
    resultDetails,
    timeSpent,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'answers',
    values,
  });
}
