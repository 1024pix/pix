const faker = require('faker');
const { status: assessmentStatuses } = require('../../../../lib/domain/models/AssessmentResult');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

module.exports = function buildAssessmentResult({
  pixScore = 31,
  status = faker.random.objectElement(assessmentStatuses),
  emitter = 'PIX-ALGO',
  commentForJury = 'Comment for Jury',
  commentForCandidate = 'Comment for Candidate',
  commentForOrganization = 'Comment for Organization',
  id = faker.random.number(),
  createdAt = new Date('2018-01-12T01:02:03Z'),
  juryId = 1,
  assessmentId = faker.random.number(),
  competenceMarks = [],
} = {}) {

  return new AssessmentResult({
    pixScore,
    status,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    id,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};
