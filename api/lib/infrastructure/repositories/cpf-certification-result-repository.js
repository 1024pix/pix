const { knex } = require('../bookshelf');
const CpfCertificationResult = require('../../domain/read-models/CpfCertificationResult');
const AssessmentResult = require('../../domain/models/AssessmentResult');

module.exports = {
  async findByTimeRange({ startDate, endDate }) {
    const certificationCourses = await knex('certification-courses')
      .select('certification-courses.*', 'assessment-results.pixScore', 'sessions.publishedAt')
      .select(
        knex.raw(`
        json_agg(json_build_object(
          'competenceCode', "competence-marks"."competence_code",
          'level', "competence-marks"."level"
        ) ORDER BY "competence-marks"."competence_code" asc) as "competenceMarks"`)
      )
      .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
      .innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .innerJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
      .whereNotExists(
        knex
          .select(1)
          .from({ 'last-assessment-results': 'assessment-results' })
          .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
          .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
      )
      .where('certification-courses.isPublished', true)
      .where('certification-courses.isCancelled', false)
      .where('assessment-results.status', AssessmentResult.status.VALIDATED)
      .where('sessions.publishedAt', '>=', startDate)
      .where('sessions.publishedAt', '<=', endDate)
      .groupBy('certification-courses.id', 'assessment-results.pixScore', 'sessions.publishedAt')
      .orderBy(['sessions.publishedAt', 'certification-courses.lastName', 'certification-courses.firstName']);

    return certificationCourses.map((certificationCourse) => new CpfCertificationResult(certificationCourse));
  },
};
