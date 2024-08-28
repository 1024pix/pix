import _ from 'lodash';

import { AssessmentResult } from '../../../src/shared/domain/models/index.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildAssessment } from './build-assessment.js';
import { buildCertificationCourseLastAssessmentResult } from './build-certification-course-last-assessment-result.js';
import { buildUser } from './build-user.js';

function buildAssessmentResult({
  id = databaseBuffer.getNextId(),
  pixScore = 456,
  reproducibilityRate = null,
  level = null,
  status = AssessmentResult.status.VALIDATED,
  emitter = 'PIX-ALGO',
  commentByAutoJury,
  commentByJury,
  commentForCandidate = 'Some comment for candidate',
  commentForOrganization = 'Some comment for organization',
  juryId,
  assessmentId,
  createdAt = new Date('2020-01-01'),
  certificationCourseId,
} = {}) {
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment({ certificationCourseId }).id : assessmentId;
  juryId = _.isUndefined(juryId) ? buildUser().id : juryId;

  const values = {
    id,
    pixScore,
    reproducibilityRate,
    level,
    status,
    emitter,
    commentByAutoJury,
    commentByJury,
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
}

export { buildAssessmentResult };

buildAssessmentResult.last = function ({
  certificationCourseId,
  id,
  pixScore,
  reproducibilityRate,
  level,
  status,
  emitter,
  commentByAutoJury,
  commentByJury,
  commentForCandidate,
  commentForOrganization,
  juryId,
  assessmentId,
  createdAt,
}) {
  const assessmentResult = buildAssessmentResult({
    id,
    pixScore,
    reproducibilityRate,
    level,
    status,
    emitter,
    commentByAutoJury,
    commentByJury,
    commentForCandidate,
    commentForOrganization,
    juryId,
    assessmentId,
    createdAt,
    certificationCourseId,
  });

  buildCertificationCourseLastAssessmentResult({
    certificationCourseId,
    lastAssessmentResultId: assessmentResult.id,
  });

  return assessmentResult;
};
