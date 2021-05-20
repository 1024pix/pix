const { status: assessmentResultStatuses } = require('../../../../lib/domain/models/AssessmentResult');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../../lib/domain/models/Assessment');

const buildAssessmentResult = function({
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

buildAssessmentResult.validated = function({
  id,
  pixScore,
  emitter,
  commentForJury,
  commentForCandidate,
  commentForOrganization,
  createdAt,
  juryId,
  assessmentId,
  competenceMarks,
} = {}) {
  return buildAssessmentResult({
    id,
    pixScore,
    status: assessmentResultStatuses.VALIDATED,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

buildAssessmentResult.rejected = function({
  id,
  pixScore,
  emitter,
  commentForJury,
  commentForCandidate,
  commentForOrganization,
  createdAt,
  juryId,
  assessmentId,
  competenceMarks,
} = {}) {
  return buildAssessmentResult({
    id,
    pixScore,
    status: assessmentResultStatuses.REJECTED,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

buildAssessmentResult.error = function({
  id,
  pixScore,
  emitter,
  commentForJury,
  commentForCandidate,
  commentForOrganization,
  createdAt,
  juryId,
  assessmentId,
  competenceMarks,
} = {}) {
  return buildAssessmentResult({
    id,
    pixScore,
    status: assessmentResultStatuses.ERROR,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

buildAssessmentResult.started = function({
  id,
  pixScore,
  emitter,
  commentForJury,
  commentForCandidate,
  commentForOrganization,
  createdAt,
  juryId,
  assessmentId,
  competenceMarks,
} = {}) {
  return buildAssessmentResult({
    id,
    pixScore,
    status: Assessment.states.STARTED,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

module.exports = buildAssessmentResult;
