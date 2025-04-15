import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import {
  AssessmentResult,
  status as assessmentResultStatuses,
} from '../../../../src/shared/domain/models/AssessmentResult.js';

const buildAssessmentResult = function ({
  id = 123,
  pixScore = 31,
  reproducibilityRate = 75.5,
  status = assessmentResultStatuses.VALIDATED,
  commentByJury,
  commentForCandidate,
  commentForOrganization,
  createdAt = new Date('2018-01-12T01:02:03Z'),
  juryId = 1,
  assessmentId = 456,
  competenceMarks = [],
} = {}) {
  return new AssessmentResult({
    pixScore,
    reproducibilityRate,
    status,
    commentByJury,
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
  commentByJury,
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
    commentByJury,
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
  commentByJury,
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
    commentByJury,
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
  commentByJury,
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
    commentByJury,
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
  commentByJury,
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
    commentByJury,
    commentForCandidate,
    commentForOrganization,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks,
  });
};

export { buildAssessmentResult };
