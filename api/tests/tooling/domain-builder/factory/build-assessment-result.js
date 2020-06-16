const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

module.exports = function buildAssessmentResult({
  pixScore = 31,
  status = 'validated',
  emitter = 'PIX-ALGO',
  commentForJury = 'Comment for Jury',
  commentForCandidate = 'Comment for Candidate',
  commentForOrganization = 'Comment for Organization',
  id = 1,
  createdAt = new Date('2018-01-12T01:02:03Z'),
  juryId = 1,
  assessmentId = 2,
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
