const { knex } = require('../../../db/knex-database-connection');
const { CertificationCourseNotPublishableError } = require('../../../lib/domain/errors');
const { status } = require('../../../lib/domain/models/AssessmentResult');

module.exports = {
  async publishCertificationCoursesBySessionId(sessionId) {
    const certificationDTOs = await knex('certification-courses')
      .select({
        certificationId: 'certification-courses.id',
        assessmentResultStatus: 'assessment-results.status',
      })
      .where('certification-courses.sessionId', sessionId)
      .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .whereNotExists(
        knex
          .select(1)
          .from({ 'last-assessment-results': 'assessment-results' })
          .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
          .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
      );

    const hasErrorOrStartedCertification = certificationDTOs.find(
      (dto) => !dto.assessmentResultStatus || dto.assessmentResultStatus === status.ERROR
    );
    if (hasErrorOrStartedCertification) {
      throw new CertificationCourseNotPublishableError();
    }

    const certificationDataToUpdate = certificationDTOs.map(({ certificationId, assessmentResultStatus }) => ({
      id: certificationId,
      pixCertificationStatus: assessmentResultStatus,
      isPublished: true,
      updatedAt: new Date(),
    }));

    // Trick to .batchUpdate(), which does not exist in knex per say
    await knex('certification-courses')
      .insert(certificationDataToUpdate)
      .onConflict('id')
      .merge(['pixCertificationStatus', 'isPublished', 'updatedAt']);
  },

  async unpublishCertificationCoursesBySessionId(sessionId) {
    await knex('certification-courses')
      .where({ sessionId })
      .update({ isPublished: false, pixCertificationStatus: null, updatedAt: new Date() });
  },
};
