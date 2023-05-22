import _ from 'lodash';
import { fetchPage } from '../utils/knex-utils.js';
import { knex } from '../../../db/knex-database-connection.js';
import { JuryCertificationSummary } from '../../domain/read-models/JuryCertificationSummary.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';
import { Assessment } from '../../domain/models/Assessment.js';
import { ComplementaryCertificationCourseResult } from '../../domain/models/ComplementaryCertificationCourseResult.js';

const findBySessionId = async function (sessionId) {
  const result = await _getCertificationCoursesIdBySessionIdQuery(sessionId);

  const certificationCourseIds = result.map((obj) => obj.id);

  const results = await _getByCertificationCourseIds(certificationCourseIds);

  const juryCertificationSummaryDTOs = await _getJuryCertificationSummaries(results);

  const juryCertificationSummaries = _.map(juryCertificationSummaryDTOs, _toDomain);
  return juryCertificationSummaries;
};

const findBySessionIdPaginated = async function ({ page, sessionId }) {
  const query = _getCertificationCoursesIdBySessionIdQuery(sessionId);

  const { results: orderedCertificationCourseIdsInObjects, pagination } = await fetchPage(query, page);

  const orderedCertificationCourseIds = orderedCertificationCourseIdsInObjects.map((obj) => obj.id);

  const results = await _getByCertificationCourseIds(orderedCertificationCourseIds);

  const orderedResults = orderedCertificationCourseIds.map((id) => results.find((result) => result.id === id));

  const juryCertificationSummaryDTOs = await _getJuryCertificationSummaries(orderedResults);
  const juryCertificationSummaries = _.map(juryCertificationSummaryDTOs, _toDomain);
  return {
    pagination,
    juryCertificationSummaries,
  };
};

export { findBySessionId, findBySessionIdPaginated };

async function _getJuryCertificationSummaries(results) {
  const certificationCourseIds = results.map((row) => row.id);
  const certificationIssueReportRows = await knex('certification-issue-reports').whereIn(
    'certificationCourseId',
    certificationCourseIds
  );

  const juryCertificationSummaryDTOs = _buildJuryCertificationSummaryDTOs(results, certificationIssueReportRows);
  return juryCertificationSummaryDTOs;
}

async function _getByCertificationCourseIds(orderedCertificationCourseIds) {
  return knex
    .select('certification-courses.*', 'assessment-results.pixScore')
    .select({
      assessmentResultStatus: 'assessment-results.status',
      assessmentState: 'assessments.state',
    })
    .select(
      knex.raw(
        `json_agg("complementary-certification-badges"."label") over (partition by "certification-courses".id) as "complementaryCertificationTakenLabels"`
      )
    )
    .from('certification-courses')
    .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId'
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId'
    )
    .leftJoin(
      'complementary-certification-courses',
      'complementary-certification-courses.certificationCourseId',
      'certification-courses.id'
    )
    .leftJoin('complementary-certification-course-results', function () {
      this.on(
        'complementary-certification-course-results.complementaryCertificationCourseId',
        'complementary-certification-courses.id'
      ).andOnVal(
        'complementary-certification-course-results.source',
        ComplementaryCertificationCourseResult.sources.PIX
      );
    })
    .leftJoin('badges', 'badges.key', 'complementary-certification-course-results.partnerKey')
    .leftJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .whereIn('certification-courses.id', orderedCertificationCourseIds);
}

function _getCertificationCoursesIdBySessionIdQuery(sessionId) {
  return knex
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
            .onIn('categoryId', knex.select('id').from('impactful-categories'))
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
  return juryCertificationSummaryRows.map((juryCertificationSummaryRow) => {
    const certificationIssueReports = _.filter(certificationIssueReportRows, {
      certificationCourseId: juryCertificationSummaryRow.id,
    });

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
    }
  );

  return new JuryCertificationSummary({
    ...juryCertificationSummaryDTO,
    status: juryCertificationSummaryDTO.assessmentResultStatus,
    isEndedBySupervisor: juryCertificationSummaryDTO.assessmentState === Assessment.states.ENDED_BY_SUPERVISOR,
    certificationIssueReports,
    complementaryCertificationTakenLabels: _.compact(juryCertificationSummaryDTO.complementaryCertificationTakenLabels),
  });
}
