const faker = require('faker');
const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');

module.exports = function buildAssessmentResult({
  id = faker.random.number(),
  pixScore = faker.random.number(),
  level = faker.random.number({ min: 0, max: 5 }),
  status = 'validated',
  emitter= 'PIX-ALGO',
  commentForJury = 'Comment for Jury',
  commentForCandidate = 'Comment for Candidate',
  commentForOrganization = 'Comment for Organization',
  juryId = 1,
  assessmentId = buildAssessment().id,
  createdAt = faker.date.past(),
} = {}) {

  const values = {
    id, pixScore, level, status, emitter, commentForJury, commentForCandidate, commentForOrganization, juryId,
    assessmentId, createdAt,
  };

  databaseBuffer.pushInsertable({
    tableName: 'assessment-results',
    values,
  });

  return values;
};
