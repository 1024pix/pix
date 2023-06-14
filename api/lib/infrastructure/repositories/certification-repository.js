import { knex } from '../../../db/knex-database-connection.js';
import { CertificationCourseNotPublishableError } from '../../../lib/domain/errors.js';
import { status } from '../../../lib/domain/models/AssessmentResult.js';

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
      'certification-courses-last-assessment-results.certificationCourseId'
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId'
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
  }));

  await knex.transaction(async (trx) => {
    return Promise.all(
      certificationDataToUpdate.map((certificationDatum) => {
        return trx('certification-courses').update(certificationDatum).where('id', certificationDatum.id);
      })
    );
  });
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
