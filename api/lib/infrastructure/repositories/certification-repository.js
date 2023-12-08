import { knex } from '../../../db/knex-database-connection.js';
import { CertificationCourseNotPublishableError } from '../../../lib/domain/errors.js';
import { status } from '../../../src/shared/domain/models/AssessmentResult.js';

const publishCertificationCoursesBySessionId = async function (sessionId) {
  const certificationDTOs = await knex('certification-courses')
    .select({
      certificationId: 'certification-courses.id',
      isCancelled: 'certification-courses.isCancelled',
      assessmentResultStatus: 'assessment-results.status',
    })
    .where('certification-courses.sessionId', sessionId)
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    );

  const hasCertificationInError = _hasCertificationInError(certificationDTOs);
  const hasCertificationWithNoAssessmentResultStatus = _hasCertificationWithNoAssessmentResultStatus(certificationDTOs);
  if (hasCertificationInError || hasCertificationWithNoAssessmentResultStatus) {
    throw new CertificationCourseNotPublishableError();
  }

  const certificationDataToUpdate = certificationDTOs.map(({ certificationId, assessmentResultStatus }) => ({
    id: certificationId,
    pixCertificationStatus: assessmentResultStatus,
    isPublished: true,
    updatedAt: new Date(),
    version: -1, // Version number used to meet requirements regarding the version column non-null constraint in the insert request below
  }));

  // Trick to .batchUpdate(), which does not exist in knex per say
  await knex('certification-courses')
    .insert(certificationDataToUpdate)
    .onConflict('id')
    .merge(['pixCertificationStatus', 'isPublished', 'updatedAt']);
};

const unpublishCertificationCoursesBySessionId = async function (sessionId) {
  await knex('certification-courses')
    .where({ sessionId })
    .update({ isPublished: false, pixCertificationStatus: null, updatedAt: new Date() });
};

export { publishCertificationCoursesBySessionId, unpublishCertificationCoursesBySessionId };

function _hasCertificationInError(certificationDTOs) {
  return certificationDTOs.some((dto) => dto.assessmentResultStatus === status.ERROR);
}

function _hasCertificationWithNoAssessmentResultStatus(certificationDTOs) {
  return certificationDTOs.some((dto) => dto.assessmentResultStatus === null && !dto.isCancelled);
}
