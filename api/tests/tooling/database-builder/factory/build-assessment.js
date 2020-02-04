const faker = require('faker');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const _ = require('lodash');

module.exports = function buildAssessment({
  id,
  courseId = 'recDefaultCourseId',
  userId,
  type = null,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  competenceId = 'recCompetenceId',
  campaignParticipationId = null,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {

  if (type !== 'DEMO') {
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
    campaignParticipationId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'assessments',
    values,
  });
};
