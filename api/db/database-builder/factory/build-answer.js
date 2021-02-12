const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildAnswer({
  id = databaseBuffer.getNextId(),
  value = 'Some value for answer',
  result = 'Some result for answer',
  assessmentId,
  challengeId = 'rec123ABC',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  timeout = null,
  elapsedTime = null,
  resultDetails = 'Some result details for answer.',
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
    elapsedTime,
    resultDetails,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'answers',
    values,
  });
};
