const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const Assessment = require('../../../../lib/domain/models/Assessment');

module.exports = function buildAssessment({
  id = faker.random.number(),
  courseId = 'recDefaultCourseIdValue',
  userId = buildUser().id,
  type = Assessment.types.PLACEMENT,
  state = Assessment.states.COMPLETED,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {

  const values = {
    id, courseId, userId, type, state, createdAt, updatedAt,
  };

  databaseBuffer.pushInsertable({
    tableName: 'assessments',
    values,
  });

  return values;
};

