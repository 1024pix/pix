const _ = require('lodash');
const { fetchPage } = require('../utils/knex-utils');
const { knex } = require('../../../db/knex-database-connection');
const JuryCertificationSummary = require('../../domain/read-models/JuryCertificationSummary');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');
const { ImpactfulCategories, ImpactfulSubcategories } = require('../../domain/models/CertificationIssueReportCategory');
const Assessment = require('../../domain/models/Assessment');
const ComplementaryCertificationCourseResult = require('../../domain/models/ComplementaryCertificationCourseResult');

module.exports = {
  async findBySessionId(sessionId) {
    const results = await _getBySessionIdQuery(sessionId);

    const juryCertificationSummaryDTOs = await _getJuryCertificationSummaries(results);

    const juryCertificationSummaries = _.map(juryCertificationSummaryDTOs, _toDomain);
    return juryCertificationSummaries;
  },

  async findBySessionIdPaginated({ page, sessionId }) {
    const query = _getBySessionIdQuery(sessionId);

    const { results, pagination } = await fetchPage(query, page);

    const juryCertificationSummaryDTOs = await _getJuryCertificationSummaries(results);

    const juryCertificationSummaries = _.map(juryCertificationSummaryDTOs, _toDomain);
    return {
      pagination,
      juryCertificationSummaries,
    };
  },
};

async function _getJuryCertificationSummaries(results) {
  const certificationCourseIds = results.map((row) => row.id);
  const certificationIssueReportRows = await knex('certification-issue-reports').whereIn(
    'certificationCourseId',
    certificationCourseIds
  );

  const juryCertificationSummaryDTOs = _buildJuryCertificationSummaryDTOs(results, certificationIssueReportRows);
  return juryCertificationSummaryDTOs;
}

function _getBySessionIdQuery(sessionId) {
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
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .modify(_filterMostRecentAssessmentResult)
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
    .leftJoin('certification-issue-reports', (qb) => {
      qb.on('certification-issue-reports.certificationCourseId', 'certification-courses.id')
        .onNull('certification-issue-reports.resolvedAt')
        .on((qb2) => {
          qb2
            .onIn('category', ImpactfulCategories)
            .orOnIn('subcategory', ImpactfulSubcategories)
            .orOnNull('certification-issue-reports.id');
        });
    })

    .where({
      'certification-courses.sessionId': sessionId,
    })
    .groupBy(
      'certification-courses.id',
      'assessments.id',
      'assessment-results.id',
      'complementary-certification-courses.id',
      'complementary-certification-course-results.id',
      'badges.id',
      'complementary-certification-badges.id'
    )
    .orderByRaw('count("certification-issue-reports".id) DESC')
    .orderBy('lastName', 'ASC')
    .orderBy('firstName', 'ASC')
    .orderBy('id', 'ASC');
}

function _filterMostRecentAssessmentResult(qb) {
  return qb.whereNotExists(
    knex
      .select(1)
      .from({ 'last-assessment-results': 'assessment-results' })
      .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
      .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
  );
}

function _buildJuryCertificationSummaryDTOs(juryCertificationSummaryRows, certificationIssueReportRows) {
  return juryCertificationSummaryRows.map((juryCertificationSummaryRow) => {
    const matchingCertificationIssueReportRows = _.filter(certificationIssueReportRows, {
      certificationCourseId: juryCertificationSummaryRow.id,
    });
    return {
      ...juryCertificationSummaryRow,
      certificationIssueReports: matchingCertificationIssueReportRows.map((certificationIssueReportRow) => ({
        ...certificationIssueReportRow,
      })),
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
    isCourseCancelled: juryCertificationSummaryDTO.isCancelled,
    isEndedBySupervisor: juryCertificationSummaryDTO.assessmentState === Assessment.states.ENDED_BY_SUPERVISOR,
    certificationIssueReports,
    complementaryCertificationTakenLabels: _.compact(juryCertificationSummaryDTO.complementaryCertificationTakenLabels),
  });
}
