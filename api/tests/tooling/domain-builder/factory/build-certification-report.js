import { CertificationReport } from '../../../../src/certification/shared/domain/models/CertificationReport.js';
import { buildCertificationIssueReport } from './build-certification-issue-report.js';

const buildCertificationReport = function ({
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
};

export { buildCertificationReport };
