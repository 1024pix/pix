import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CertificationIssueReport } from '../../../shared/domain/models/CertificationIssueReport.js';
import { JuryCertificationSummary } from '../../domain/read-models/JuryCertificationSummary.js';

export async function findBySessionId({ sessionId }) {
  const certificationCourseIds =
    await _getCertificationCoursesIdBySessionIdQuery(sessionId).pluck('certification-courses.id');
  const orderResults = await _getByCertificationCourseIds(certificationCourseIds);

  const juryCertificationSummaryDTOs = await _getJuryCertificationSummaries(orderResults);

  return juryCertificationSummaryDTOs.map(_toDomain);
}

export async function findBySessionIdPaginated({ page, sessionId }) {
  const query = _getCertificationCoursesIdBySessionIdQuery(sessionId);

  const { results: orderedCertificationCourseIdsInObjects, pagination } = await fetchPage({
    queryBuilder: query,
    paginationParams: page,
  });

  const orderedCertificationCourseIds = orderedCertificationCourseIdsInObjects.map((obj) => obj.id);
  const orderedResults = await _getByCertificationCourseIds(orderedCertificationCourseIds);

  const juryCertificationSummaryDTOs = await _getJuryCertificationSummaries(orderedResults);
  const juryCertificationSummaries = juryCertificationSummaryDTOs.map(_toDomain);
  return {
    pagination,
    juryCertificationSummaries,
  };
}

async function _getJuryCertificationSummaries(results) {
  const knexConn = DomainTransaction.getConnection();
  const certificationCourseIds = results.map((row) => row.id);
  const certificationIssueReportRows = await knexConn('certification-issue-reports').whereIn(
    'certificationCourseId',
    certificationCourseIds,
  );

  return _buildJuryCertificationSummaryDTOs(results, certificationIssueReportRows);
}

async function _getByCertificationCourseIds(orderedCertificationCourseIds) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select(
      'certification-courses.*',
      'assessment-results.pixScore',
      'assessment-results.reachedMeshIndex',
      'assessment-results.eduV3ExternalJuryResult',
    )
    .select({
      assessmentResultStatus: 'assessment-results.status',
      assessmentState: 'assessments.state',
    })
    .from('certification-courses')
    .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .whereIn('certification-courses.id', orderedCertificationCourseIds);

  const resultsById = Map.groupBy(results, ({ id }) => id);

  return orderedCertificationCourseIds.map((orderedId) => resultsById.get(orderedId)?.[0]);
}

function _getCertificationCoursesIdBySessionIdQuery(sessionId) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .with('impactful-categories', (qb) => {
      qb.select('id').from('issue-report-categories').where({ isImpactful: true });
    })
    .select('certification-courses.id')
    .from('certification-courses')
    .leftJoin('certification-issue-reports', (qb) => {
      qb.on('certification-issue-reports.certificationCourseId', 'certification-courses.id')
        .onNull('certification-issue-reports.resolvedAt')
        .on((qb2) => {
          qb2
            .onIn('categoryId', knexConn.select('id').from('impactful-categories'))
            .orOnNull('certification-issue-reports.id');
        });
    })

    .where({
      'certification-courses.sessionId': sessionId,
    })
    .groupBy('certification-courses.id')
    .orderByRaw('count("certification-issue-reports".id) DESC')
    .orderBy('lastName', 'ASC')
    .orderBy('firstName', 'ASC')
    .orderBy('id', 'ASC');
}

function _buildJuryCertificationSummaryDTOs(juryCertificationSummaryRows, certificationIssueReportRows) {
  const certificationIssueReportRowsByCertificationCourseId = Map.groupBy(
    certificationIssueReportRows,
    ({ certificationCourseId }) => certificationCourseId,
  );

  return juryCertificationSummaryRows.map((juryCertificationSummaryRow) => {
    const certificationIssueReports =
      certificationIssueReportRowsByCertificationCourseId.get(juryCertificationSummaryRow.id) ?? [];

    return {
      ...juryCertificationSummaryRow,
      certificationIssueReports,
    };
  });
}

function _toDomain(juryCertificationSummaryDTO) {
  const certificationIssueReports = juryCertificationSummaryDTO.certificationIssueReports.map(
    (certificationIssueReportDTO) => {
      return new CertificationIssueReport(certificationIssueReportDTO);
    },
  );
  return new JuryCertificationSummary({
    ...juryCertificationSummaryDTO,
    algorithmVersion: juryCertificationSummaryDTO.version,
    status: juryCertificationSummaryDTO.assessmentResultStatus,
    isEndedByInvigilator: juryCertificationSummaryDTO.assessmentState === Assessment.states.ENDED_BY_INVIGILATOR,
    certificationFramework: juryCertificationSummaryDTO.framework,
    certificationIssueReports,
  });
}
