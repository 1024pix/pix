const Assessment = require('../../../lib/domain/models/Assessment');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildAssessment({
  id = faker.random.number(),
  courseId = 'default value',
  userId = faker.random.number(),
  type = Assessment.types.PLACEMENT,
  state = Assessment.states.COMPLETED,
} = {}) {

  const values = {
    id, courseId, userId, type, state,
  };

  databaseBuffer.pushInsertable({
    tableName: 'assessments',
    values,
  });

  return values;
};

