import _ from 'lodash';

import { AssessmentResult } from '../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuffer } from '../database-buffer.ts';
import { buildAssessment } from './build-assessment.js';
import { buildCertificationCourseLastAssessmentResult } from './build-certification-course-last-assessment-result.js';
import { buildUser } from './build-user.ts';

function buildAssessmentResult({
  id = databaseBuffer.getNextId(),
  pixScore = 456,
  reproducibilityRate = null,
  level = null,
  status = AssessmentResult.status.VALIDATED,
  emitter = null,
  commentByAutoJury,
  commentByJury,
  commentForCandidate = 'Some comment for candidate',
  commentForOrganization = 'Some comment for organization',
  juryId,
  assessmentId,
  createdAt = new Date('2020-01-01'),
  certificationCourseId,
  capacity,
  reachedMeshIndex = null,
  eduV3ExternalJuryResult = null,
  versionId,
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
    capacity,
    reachedMeshIndex,
    eduV3ExternalJuryResult,
    versionId,
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
  capacity,
  reachedMeshIndex,
  eduV3ExternalJuryResult,
  versionId,
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
    capacity,
    reachedMeshIndex,
    eduV3ExternalJuryResult,
    versionId,
  });

  buildCertificationCourseLastAssessmentResult({
    certificationCourseId,
    lastAssessmentResultId: assessmentResult.id,
  });

  return assessmentResult;
};
