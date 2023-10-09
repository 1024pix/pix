import { knex } from '../../../db/knex-database-connection.js';
import { CpfCertificationResult } from '../../domain/read-models/CpfCertificationResult.js';
import { AssessmentResult } from '../../domain/models/AssessmentResult.js';
import { ImportStatus } from '../../../src/certification/compte-personnel-formation/domain/models/ImportStatus.js';

const findByBatchId = async function (batchId) {
  const cpfCertificationResults = await _selectCpfCertificationResults()
    .select('certification-courses.*', 'assessment-results.pixScore', 'sessions.publishedAt')
    .select(
      knex.raw(`
      json_agg(json_build_object(
        'competenceCode', "competence-marks"."competence_code",
        'areaCode', "competence-marks"."area_code",
        'level', "competence-marks"."level"
      ) ORDER BY "competence-marks"."competence_code" asc) as "competenceMarks"`),
    )
    .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .where('compte-personnel-formation.filename', batchId)
    .groupBy('certification-courses.id', 'assessment-results.pixScore', 'sessions.publishedAt');
  return cpfCertificationResults.map((certificationCourse) => new CpfCertificationResult(certificationCourse));
};

const markCertificationCoursesAsExported = async function ({ certificationCourseIds, filename }) {
  return knex('compte-personnel-formation')
    .update({ filename, importStatus: ImportStatus.READY_TO_SEND, updatedAt: knex.fn.now() })
    .whereIn('certificationCourseId', certificationCourseIds);
};

const countExportableCertificationCoursesByTimeRange = async function ({ qb = knex, startDate, endDate }) {
  const { count } = await _findSchedulableCpfCertificationResults({ qb, startDate, endDate })
    .count('certification-courses.id')
    .first();
  return count;
};

const markCertificationToExport = async function ({ startDate, endDate, limit, offset, batchId }) {
  return await knex
    .into(
      knex.raw('?? (??, ??, ??, ??, ??)', [
        'compte-personnel-formation',
        'certificationCourseId',
        'filename',
        'importStatus',
        'createdAt',
        'updatedAt',
      ]),
    )
    .insert((qb) => {
      _findSchedulableCpfCertificationResults({ qb, startDate, endDate })
        .select([
          'certification-courses.id as certificationCourseId',
          knex.raw('? as filename', [batchId]),
          knex.raw('?  as importStatus', [ImportStatus.PENDING]),
          knex.raw('? as createdAt', [knex.fn.now()]),
          knex.raw('? as updatedAt', [knex.fn.now()]),
        ])
        .orderBy('certification-courses.id')
        .offset(offset)
        .limit(limit);
    });
};

const updateCertificationImportStatus = async function ({ certificationCourseIds, cpfImportStatus }) {
  return knex('compte-personnel-formation')
    .update({ importStatus: cpfImportStatus, updatedAt: knex.fn.now() })
    .whereIn('certificationCourseId', certificationCourseIds);
};

export {
  countExportableCertificationCoursesByTimeRange as countExportableCertificationCoursesByTimeRange,
  findByBatchId,
  markCertificationCoursesAsExported,
  markCertificationToExport,
  updateCertificationImportStatus,
};

function _selectCpfCertificationResults(qb = knex) {
  return qb
    .from('certification-courses')
    .innerJoin('sessions', 'sessions.id', 'certification-courses.sessionId')
    .innerJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .leftJoin(
      'compte-personnel-formation',
      'certification-courses.id',
      'compte-personnel-formation.certificationCourseId',
    );
}

function _filterQuery(qb = knex, startDate, endDate) {
  return qb
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false)
    .whereNotNull('certification-courses.sex')
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('sessions.publishedAt', '>=', startDate)
    .where('sessions.publishedAt', '<=', endDate);
}

const _findSchedulableCpfCertificationResults = ({ qb = knex, startDate, endDate }) => {
  return _filterQuery(_selectCpfCertificationResults(qb), startDate, endDate).whereNull(
    'compte-personnel-formation.importStatus',
  );
};
