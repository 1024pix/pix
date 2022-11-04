const { knex } = require('../../../db/knex-database-connection');
const CpfCertificationResult = require('../../domain/read-models/CpfCertificationResult');
const AssessmentResult = require('../../domain/models/AssessmentResult');

module.exports = {
  async getIdsByTimeRange({ startDate, endDate }) {
    const ids = await _selectCpfCertificationResults({ startDate, endDate })
      .pluck('certification-courses.id')
      .orderBy('certification-courses.id');
    return ids;
  },

  async findByTimeRange({ startDate, endDate, offset, limit }) {
    const certificationCourses = await _selectCpfCertificationResults({ startDate, endDate })
      .orderBy('certification-courses.id')
      .offset(offset)
      .limit(limit);

    return certificationCourses.map((certificationCourse) => new CpfCertificationResult(certificationCourse));
  },

  async findByJobId(jobId) {},

  async markCertificationCoursesAsExported({ certificationCourseIds, filename }) {
    return knex('certification-courses').update({ cpfFilename: filename }).whereIn('id', certificationCourseIds);
  },

  async markCertificationToExport({ certificationCourseIds, filename }) {
    return knex('certification-courses').update({ cpfFilename: filename }).whereIn('id', certificationCourseIds);
  },
};

function _selectCpfCertificationResults({ startDate, endDate }) {
  return knex('certification-courses')
    .select('certification-courses.*', 'assessment-results.pixScore', 'sessions.publishedAt')
    .select(
      knex.raw(`
        json_agg(json_build_object(
          'competenceCode', "competence-marks"."competence_code",
          'areaCode', "competence-marks"."area_code",
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
    .whereNull('certification-courses.cpfFilename')
    .whereNotNull('certification-courses.sex')
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('competence-marks.level', '>', -1)
    .where('sessions.publishedAt', '>=', startDate)
    .where('sessions.publishedAt', '<=', endDate)
    .groupBy('certification-courses.id', 'assessment-results.pixScore', 'sessions.publishedAt');
}
