const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const _ = require('lodash');

module.exports = function buildAssessment({
  id,
  courseId = 'recDefaultCourseId',
  certificationCourseId = null,
  userId,
  type = null,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  competenceId = 'recCompetenceId',
  campaignParticipationId = null,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {

  if (type !== Assessment.types.DEMO) {
    userId = _.isUndefined(userId) ? buildUser().id : userId;
  }

  if (type === Assessment.types.CERTIFICATION) {
    courseId = _.isUndefined(courseId) ? buildCertificationCourse({ userId }).id : courseId;
    certificationCourseId = courseId;
  }

  const values = {
    id,
    courseId,
    certificationCourseId,
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
