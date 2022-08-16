const _ = require('lodash');
const { knex } = require('../bookshelf');
const JuryCertificationSummary = require('../../domain/read-models/JuryCertificationSummary');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');
const Assessment = require('../../domain/models/Assessment');

module.exports = {
  async findBySessionId(sessionId) {
    const juryCertificationSummaryRows = await knex
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
        ).andOnVal('complementary-certification-course-results.source', 'PIX');
      })
      .leftJoin('badges', 'badges.key', 'complementary-certification-course-results.partnerKey')
      .leftJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')

      .where('certification-courses.sessionId', sessionId)
      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    const certificationCourseIds = juryCertificationSummaryRows.map((row) => row.id);
    const certificationIssueReportRows = await knex('certification-issue-reports').whereIn(
      'certificationCourseId',
      certificationCourseIds
    );

    const juryCertificationSummaryDTOs = _buildJuryCertificationSummaryDTOs(
      juryCertificationSummaryRows,
      certificationIssueReportRows
    );

    return _.map(juryCertificationSummaryDTOs, _toDomain);
  },
};

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
