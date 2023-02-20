import CertificationReport from '../../../../lib/domain/models/CertificationReport';
import buildCertificationIssueReport from './build-certification-issue-report';

export default function buildCertificationReport({
  id = 'CertificationReport:456',
  firstName = 'Tiffany',
  lastName = 'Schwarzenegger',
  hasSeenEndTestScreen = false,
  examinerComment,
  isCompleted,
  certificationIssueReports,
  certificationCourseId = 456,
  abortReason = null,
} = {}) {
  return new CertificationReport({
    id,
    certificationCourseId,
    firstName,
    lastName,
    hasSeenEndTestScreen,
    examinerComment,
    isCompleted,
    certificationIssueReports: certificationIssueReports
      ? certificationIssueReports
      : [buildCertificationIssueReport({ certificationCourseId })],
    abortReason,
  });
}
