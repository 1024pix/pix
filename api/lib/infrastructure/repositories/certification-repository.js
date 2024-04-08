import { knex } from '../../../db/knex-database-connection.js';

const publishCertificationCourses = async function (certificationStatuses) {
  const certificationDataToUpdate = certificationStatuses.map(({ certificationCourseId }) => ({
    id: certificationCourseId,
    isPublished: true,
    updatedAt: new Date(),
    version: -1, // Version number used to meet requirements regarding the version column non-null constraint in the insert request below
  }));

  // Trick to .batchUpdate(), which does not exist in knex per say
  await knex('certification-courses')
    .insert(certificationDataToUpdate)
    .onConflict('id')
    .merge(['isPublished', 'updatedAt']);
};

const getStatusesBySessionId = async function (sessionId) {
  return knex('certification-courses')
    .select({
      certificationCourseId: 'certification-courses.id',
      isCancelled: 'certification-courses.isCancelled',
      pixCertificationStatus: 'assessment-results.status',
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
};

const unpublishCertificationCoursesBySessionId = async function (sessionId) {
  await knex('certification-courses').where({ sessionId }).update({ isPublished: false, updatedAt: new Date() });
};

export { getStatusesBySessionId, publishCertificationCourses, unpublishCertificationCoursesBySessionId };
