import buildAssessment from './build-assessment';
import buildCertificationCourseLastAssessmentResult from './build-certification-course-last-assessment-result';
import buildUser from './build-user';
import databaseBuffer from '../database-buffer';
import AssessmentResult from '../../../lib/domain/models/AssessmentResult';
import _ from 'lodash';

function buildAssessmentResult({
  id = databaseBuffer.getNextId(),
  pixScore = 456,
  reproducibilityRate = null,
  level = null,
  status = AssessmentResult.status.VALIDATED,
  emitter = 'PIX-ALGO',
  commentForJury = 'Some comment for jury',
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
    commentForJury,
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

export default buildAssessmentResult;

buildAssessmentResult.last = function ({
  certificationCourseId,
  id,
  pixScore,
  reproducibilityRate,
  level,
  status,
  emitter,
  commentForJury,
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
    commentForJury,
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
