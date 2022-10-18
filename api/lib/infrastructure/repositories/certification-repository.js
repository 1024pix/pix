const { knex } = require('../../../db/knex-database-connection');
const { CertificationCourseNotPublishableError } = require('../../../lib/domain/errors');

module.exports = {
  async publishCertificationCoursesBySessionId(sessionId) {
    const latestAssessmentResultStatuses = await knex('certification-courses')
      .pluck('assessment-results.status')
      .where('certification-courses.sessionId', sessionId)
      .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .whereNotExists(
        knex
          .select(1)
          .from({ 'last-assessment-results': 'assessment-results' })
          .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
          .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
      );

    if (latestAssessmentResultStatuses.includes('error') || latestAssessmentResultStatuses.includes('started')) {
      throw new CertificationCourseNotPublishableError();
    }

    await knex('certification-courses').where({ sessionId }).update({ isPublished: true, updatedAt: new Date() });
  },

  async unpublishCertificationCoursesBySessionId(sessionId) {
    await knex('certification-courses').where({ sessionId }).update({ isPublished: false, updatedAt: new Date() });
  },
};
