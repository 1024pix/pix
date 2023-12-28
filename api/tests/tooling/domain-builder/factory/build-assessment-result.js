import {
  AssessmentResult,
  status as assessmentResultStatuses,
} from '../../../../src/shared/domain/models/AssessmentResult.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';

const buildAssessmentResult = function ({
  id = 123,
  pixScore = 31,
  reproducibilityRate = 75.5,
  status = assessmentResultStatuses.VALIDATED,
  emitter = 'PIX-ALGO',
  commentByAutoJury = 'Some comment by auto jury',
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
    reproducibilityRate,
    status,
    emitter,
    commentByAutoJury,
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

buildAssessmentResult.validated = function ({
  id,
  pixScore,
  reproducibilityRate,
  emitter,
  commentByAutoJury,
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
    reproducibilityRate,
    status: assessmentResultStatuses.VALIDATED,
    emitter,
    commentByAutoJury,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

buildAssessmentResult.rejected = function ({
  id,
  pixScore,
  reproducibilityRate,
  emitter,
  commentByAutoJury,
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
    reproducibilityRate,
    status: assessmentResultStatuses.REJECTED,
    emitter,
    commentByAutoJury,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

buildAssessmentResult.error = function ({
  id,
  pixScore,
  emitter,
  commentByAutoJury,
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
    reproducibilityRate: 0,
    status: assessmentResultStatuses.ERROR,
    emitter,
    commentByAutoJury,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

buildAssessmentResult.started = function ({
  id,
  pixScore,
  emitter,
  commentByAutoJury,
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
    reproducibilityRate: 0,
    status: Assessment.states.STARTED,
    emitter,
    commentByAutoJury,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

buildAssessmentResult.notTrustable = function ({
  pixScore,
  reproducibilityRate,
  status,
  assessmentId,
  juryId,
  emitter,
} = {}) {
  return AssessmentResult.buildNotTrustableAssessmentResult({
    pixScore,
    reproducibilityRate,
    status,
    assessmentId,
    juryId,
    emitter,
  });
};

buildAssessmentResult.standard = function ({
  pixScore,
  reproducibilityRate,
  status,
  assessmentId,
  juryId,
  emitter,
} = {}) {
  return AssessmentResult.buildStandardAssessmentResult({
    pixScore,
    reproducibilityRate,
    status,
    assessmentId,
    juryId,
    emitter,
  });
};

export { buildAssessmentResult };
