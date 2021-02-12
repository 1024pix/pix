const { status: assessmentResultStatuses } = require('../../../../lib/domain/models/AssessmentResult');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

module.exports = function buildAssessmentResult({
  id = 123,
  pixScore = 31,
  status = assessmentResultStatuses.VALIDATED,
  emitter = 'PIX-ALGO',
  commentForJury = 'Comment for Jury',
  commentForCandidate = 'Comment for Candidate',
  commentForOrganization = 'Comment for Organization',
  createdAt = new Date('2018-01-12T01:02:03Z'),
  juryId = 1,
  assessmentId = 456,
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
