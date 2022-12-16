const CertificationReport = require('../../../../lib/domain/models/CertificationReport');
const buildCertificationIssueReport = require('./build-certification-issue-report');

module.exports = function buildCertificationReport({
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
