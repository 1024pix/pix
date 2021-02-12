const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const AssessmentResult = require('../../../lib/domain/models/AssessmentResult');
const _ = require('lodash');

module.exports = function buildAssessmentResult({
  id = databaseBuffer.getNextId(),
  pixScore = 456,
  level = null,
  status = AssessmentResult.status.VALIDATED,
  emitter = 'PIX_ALGO',
  commentForJury = 'Some comment for jury',
  commentForCandidate = 'Some comment for candidate',
  commentForOrganization = 'Some comment for organization',
  juryId,
  assessmentId,
  createdAt = new Date('2020-01-01'),
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
