import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { CpfImportStatus } from '../../domain/models/CpfImportStatus.js';
import { CpfCertificationResult } from '../../domain/read-models/CpfCertificationResult.js';

const findByBatchId = async function (batchId) {
  const knexConn = DomainTransaction.getConnection();

  const cpfCertificationResults = await _selectCpfCertificationResults(knexConn)
    .select('certification-courses.*', 'assessment-results.pixScore', 'sessions.publishedAt')
    .select(
      knexConn.raw(`
      json_agg(json_build_object(
        'competenceCode', "competence-marks"."competence_code",
        'areaCode', "competence-marks"."area_code",
        'level', "competence-marks"."level"
      ) ORDER BY "competence-marks"."competence_code" asc) as "competenceMarks"`),
    )
    .innerJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .where('certification-courses-cpf-infos.filename', batchId)
    .groupBy('certification-courses.id', 'assessment-results.pixScore', 'sessions.publishedAt');
  return cpfCertificationResults.map((certificationCourse) => new CpfCertificationResult(certificationCourse));
};

const markCertificationCoursesAsExported = async function ({ certificationCourseIds, filename }) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('certification-courses-cpf-infos')
    .update({ filename, importStatus: CpfImportStatus.READY_TO_SEND, updatedAt: knexConn.fn.now() })
    .whereIn('certificationCourseId', certificationCourseIds);
};

const countExportableCertificationCoursesByTimeRange = async function ({ startDate, endDate }) {
  const knexConn = DomainTransaction.getConnection();

  const { count } = await _findSchedulableCpfCertificationResults(knexConn, startDate, endDate)
    .count('certification-courses.id')
    .first();
  return count;
};

const markCertificationToExport = async function ({ startDate, endDate, limit, offset, batchId }) {
  const knexConn = DomainTransaction.getConnection();

  return await knexConn
    .into(
      knexConn.raw('?? (??, ??, ??, ??, ??)', [
        'certification-courses-cpf-infos',
        'certificationCourseId',
        'filename',
        'importStatus',
        'createdAt',
        'updatedAt',
      ]),
    )
    .insert((qb) => {
      _findSchedulableCpfCertificationResults(qb, startDate, endDate)
        .select([
          'certification-courses.id as certificationCourseId',
          knexConn.raw('? as filename', [batchId]),
          knexConn.raw('?  as importStatus', [CpfImportStatus.PENDING]),
          knexConn.raw('? as createdAt', [knexConn.fn.now()]),
          knexConn.raw('? as updatedAt', [knexConn.fn.now()]),
        ])
        .orderBy('certification-courses.id')
        .offset(offset)
        .limit(limit);
    });
};

const updateCpfInfos = async function ({ cpfInfos }) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('certification-courses-cpf-infos')
    .update({ importStatus: cpfInfos.importStatus, updatedAt: knexConn.fn.now() })
    .where({
      certificationCourseId: cpfInfos.certificationCourseId,
      filename: cpfInfos.filename,
    });
};

export {
  countExportableCertificationCoursesByTimeRange,
  findByBatchId,
  markCertificationCoursesAsExported,
  markCertificationToExport,
  updateCpfInfos,
};

function _selectCpfCertificationResults(qb) {
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
      'certification-courses-cpf-infos',
      'certification-courses.id',
      'certification-courses-cpf-infos.certificationCourseId',
    );
}

function _filterQuery(qb, startDate, endDate) {
  return qb
    .where('certification-courses.isPublished', true)
    .whereNotNull('certification-courses.sex')
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('sessions.publishedAt', '>=', startDate)
    .where('sessions.publishedAt', '<=', endDate);
}

const _findSchedulableCpfCertificationResults = (qb, startDate, endDate) => {
  return _filterQuery(_selectCpfCertificationResults(qb), startDate, endDate).whereNull(
    'certification-courses-cpf-infos.importStatus',
  );
};
