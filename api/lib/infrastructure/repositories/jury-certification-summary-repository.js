const _ = require('lodash');
const { knex } = require('../bookshelf');
const JuryCertificationSummary = require('../../domain/read-models/JuryCertificationSummary');
const CertificationIssueReport = require('../../domain/models/CertificationIssueReport');
const ComplementaryCertificationCourseResult = require('../../domain/models/ComplementaryCertificationCourseResult');
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
          `json_agg("complementary-certification-course-results".*) over (partition by "certification-courses".id) as "complementaryCertificationCourseResults"`
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
      .leftJoin(
        'complementary-certification-course-results',
        'complementary-certification-course-results.complementaryCertificationCourseId',
        'complementary-certification-courses.id'
      )

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

  const complementaryCertificationCourseResults = _.compact(
    juryCertificationSummaryDTO.complementaryCertificationCourseResults
  ).map(ComplementaryCertificationCourseResult.from);

  return new JuryCertificationSummary({
    ...juryCertificationSummaryDTO,
    status: juryCertificationSummaryDTO.assessmentResultStatus,
    isCourseCancelled: juryCertificationSummaryDTO.isCancelled,
    isEndedBySupervisor: juryCertificationSummaryDTO.assessmentState === Assessment.states.ENDED_BY_SUPERVISOR,
    certificationIssueReports,
    complementaryCertificationCourseResults,
  });
}
