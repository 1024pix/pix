const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const _ = require('lodash');

module.exports = function buildAssessment({
  id,
  courseId = 'recDefaultCourseIdValue',
  userId,
  type = Assessment.types.PLACEMENT,
  state = Assessment.states.COMPLETED,
  competenceId = null,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
  completedAt = null,
} = {}) {
  if (type != 'DEMO') {
    userId = _.isNil(userId) ? buildUser().id : userId;
  }

  const values = {
    id, courseId, userId, type, state, createdAt, updatedAt, completedAt, competenceId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'assessments',
    values,
  });
};

