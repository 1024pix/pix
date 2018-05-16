const AssessmentResult = require('../../lib/domain/models/AssessmentResult');

module.exports = function({
  pixScore = 31,
  level = 3,
  status = 'validated',
  emitter = 'PIX-ALGO',
  commentForJury = 'Comment for Jury',
  commentForCandidate = 'Comment for Candidate',
  commentForOrganization = 'Comment for Organization',
  id = 1,
  createdAt = new Date('2018-01-12'),
  juryId = 1,
  assessmentId = 2,
  competenceMarks = [],
} = {}) {

  return new AssessmentResult({
    pixScore,
    level,
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

