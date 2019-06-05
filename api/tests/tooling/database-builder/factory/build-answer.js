const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildAnswer({
  id,
  value = 'default value',
  result = 'ok',
  assessmentId,
  challengeId = 'rec123456',
} = {}) {

  assessmentId = _.isNil(assessmentId) ? buildAssessment().id : assessmentId;

  const values = {
    id, value, result, assessmentId, challengeId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'answers',
    values,
  });
};
