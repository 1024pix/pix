import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';
import { CertificationReport } from '../../domain/models/CertificationReport.js';

export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationReportsData = await knexConn
    .select({
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      examinerComment: 'certification-courses.examinerComment',
      certificationCourseId: 'certification-courses.id',
      assessmentState: 'assessments.state',
      abortReason: 'certification-courses.abortReason',
      issueReportId: 'certification-issue-reports.id',
      issueReportCategory: 'certification-issue-reports.category',
      issueReportCategoryId: 'certification-issue-reports.categoryId',
      issueReportDescription: 'certification-issue-reports.description',
      issueReportSubcategory: 'certification-issue-reports.subcategory',
      issueReportQuestionNumber: 'certification-issue-reports.questionNumber',
      issueReportHasBeenAutomaticallyResolved: 'certification-issue-reports.hasBeenAutomaticallyResolved',
      issueReportLiveAlertId: 'certification-issue-reports.liveAlertId',
      issueReportResolvedAt: 'certification-issue-reports.resolvedAt',
      issueReportResolution: 'certification-issue-reports.resolution',
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin(
      'certification-issue-reports',
      'certification-issue-reports.certificationCourseId',
      'certification-courses.id',
    )
    .where('certification-courses.sessionId', sessionId)
    .orderByRaw('LOWER("certification-courses"."lastName") ASC, LOWER("certification-courses"."firstName") ASC');

  if (!certificationReportsData.length) {
    return [];
  }
  const certificationReportsWithIssuesDataByCertif = new Map();

  for (const certificationReportWithIssuesDataByCertif of certificationReportsData) {
    if (
      !certificationReportsWithIssuesDataByCertif.has(certificationReportWithIssuesDataByCertif.certificationCourseId)
    ) {
      certificationReportsWithIssuesDataByCertif.set(
        certificationReportWithIssuesDataByCertif.certificationCourseId,
        [],
      );
    }
    certificationReportsWithIssuesDataByCertif
      .get(certificationReportWithIssuesDataByCertif.certificationCourseId)
      .push(certificationReportWithIssuesDataByCertif);
  }

  return Array.from(certificationReportsWithIssuesDataByCertif.values(), toDomain);
}

function toDomain(certificationReportWithIssuesData) {
  const certificationIssueReports = [];
  for (const issueReportData of certificationReportWithIssuesData) {
    if (issueReportData.issueReportId) {
      const issueReport = new CertificationIssueReport({
        id: issueReportData.issueReportId,
        certificationCourseId: issueReportData.certificationCourseId,
        category: issueReportData.issueReportCategory,
        categoryId: issueReportData.issueReportCategoryId,
        description: issueReportData.issueReportDescription,
        subcategory: issueReportData.issueReportSubcategory,
        questionNumber: issueReportData.issueReportQuestionNumber,
        hasBeenAutomaticallyResolved: issueReportData.issueReportHasBeenAutomaticallyResolved,
        liveAlertId: issueReportData.issueReportLiveAlertId,
        resolvedAt: issueReportData.issueReportResolvedAt,
        resolution: issueReportData.issueReportResolution,
      });
      certificationIssueReports.push(issueReport);
    }
  }

  return new CertificationReport({
    ...certificationReportWithIssuesData[0],
    isCompleted: certificationReportWithIssuesData[0].assessmentState === Assessment.states.COMPLETED,
    certificationIssueReports,
  });
}
