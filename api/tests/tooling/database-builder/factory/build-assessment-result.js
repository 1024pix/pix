const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const _ = require('lodash');

module.exports = function buildAssessmentResult({
  id,
  pixScore = faker.random.number(),
  level = faker.random.number(),
  status = AssessmentResult.status.VALIDATED,
  emitter = 'PIX_ALGO',
  commentForJury = faker.lorem.sentences(),
  commentForCandidate = faker.lorem.sentences(),
  commentForOrganization = faker.lorem.sentences(),
  juryId,
  assessmentId,
  createdAt = faker.date.past(),
} = {}) {

  assessmentId = _.isUndefined(assessmentId) ? buildAssessment().id : assessmentId;
  juryId = _.isUndefined(juryId) ? buildUser().id : juryId;

  const values = {
    id,
    pixScore,
    level,
    status,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    juryId,
    assessmentId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'assessment-results',
    values,
  });
};
