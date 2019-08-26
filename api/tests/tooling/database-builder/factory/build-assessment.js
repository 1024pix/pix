const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const _ = require('lodash');

module.exports = function buildAssessment({
  id,
  courseId = 'recDefaultCourseId',
  userId,
  type = Assessment.types.PLACEMENT,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  competenceId = null,
  campaignParticipationId = null,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {

  if (type != 'DEMO') {
    userId = _.isUndefined(userId) ? buildUser().id : userId;
  }

  const values = {
    id,
    courseId,
    userId,
    type,
    isImproving,
    state,
    createdAt,
    updatedAt,
    competenceId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'assessments',
    values,
  });
};

