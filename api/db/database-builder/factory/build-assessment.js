const faker = require('faker');
const buildCertificationCourse = require('./build-certification-course');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const Assessment = require('../../../lib/domain/models/Assessment');
const _ = require('lodash');

module.exports = function buildAssessment({
  id,
  courseId = 'recDefaultCourseId',
  certificationCourseId,
  userId,
  type = null,
  state = Assessment.states.COMPLETED,
  isImproving = false,
  lastQuestionDate = new Date(),
  competenceId = 'recCompetenceId',
  campaignParticipationId = null,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {

  if (type !== Assessment.types.DEMO) {
    userId = _.isUndefined(userId) ? buildUser().id : userId;
  }

  if (type === Assessment.types.CERTIFICATION) {
    certificationCourseId = _.isUndefined(certificationCourseId) ? buildCertificationCourse({ userId }).id : certificationCourseId;
  }

  const values = {
    id,
    courseId,
    certificationCourseId,
    userId,
    type,
    isImproving,
    state,
    lastQuestionDate,
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
