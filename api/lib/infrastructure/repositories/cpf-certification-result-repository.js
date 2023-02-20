import { knex } from '../../../db/knex-database-connection';
import CpfCertificationResult from '../../domain/read-models/CpfCertificationResult';
import AssessmentResult from '../../domain/models/AssessmentResult';
import { cpfImportStatus } from '../../domain/models/CertificationCourse';

export default {
  async getIdsByTimeRange({ startDate, endDate }) {
    const ids = await _selectCpfCertificationResults({ startDate, endDate })
      .select('certification-courses.id')
      .where('certification-courses.isPublished', true)
      .where('certification-courses.isCancelled', false)
      .whereNotNull('certification-courses.sex')
      .where('assessment-results.status', AssessmentResult.status.VALIDATED)
      .where('competence-marks.level', '>', -1)
      .where('sessions.publishedAt', '>=', startDate)
      .where('sessions.publishedAt', '<=', endDate)
      .whereNull('certification-courses.cpfImportStatus')
      .pluck('certification-courses.id')
      .orderBy('certification-courses.id');
    return ids;
  },

  async findByBatchId(batchId) {
    const cpfCertificationResults = await _selectCpfCertificationResults()
      .select('certification-courses.*', 'assessment-results.pixScore', 'sessions.publishedAt')
      .select(
        knex.raw(`
        json_agg(json_build_object(
          'competenceCode', "competence-marks"."competence_code",
          'areaCode', "competence-marks"."area_code",
          'level', "competence-marks"."level"
        ) ORDER BY "competence-marks"."competence_code" asc) as "competenceMarks"`)
      )
      .where('certification-courses.cpfFilename', batchId);
    return cpfCertificationResults.map((certificationCourse) => new CpfCertificationResult(certificationCourse));
  },

  async markCertificationCoursesAsExported({ certificationCourseIds, filename }) {
    const now = new Date();

    return knex('certification-courses')
      .update({ cpfFilename: filename, cpfImportStatus: cpfImportStatus.READY_TO_SEND, updatedAt: now })
      .whereIn('id', certificationCourseIds);
  },

  async markCertificationToExport({ certificationCourseIds, batchId }) {
    const now = new Date();

    return knex('certification-courses')
      .update({ cpfFilename: batchId, cpfImportStatus: cpfImportStatus.PENDING, updatedAt: now })
      .whereIn('id', certificationCourseIds);
  },

  async updateCertificationImportStatus({ certificationCourseIds, cpfImportStatus }) {
    const now = new Date();

    return knex('certification-courses')
      .update({ cpfImportStatus, updatedAt: now })
      .whereIn('id', certificationCourseIds);
  },
};

function _selectCpfCertificationResults() {
  return knex('certification-courses')
    .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
    .innerJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId'
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId'
    )
    .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .groupBy('certification-courses.id', 'assessment-results.pixScore', 'sessions.publishedAt');
}
