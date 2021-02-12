const CertificationReport = require('../../../../lib/domain/models/CertificationReport');
const buildCertificationIssueReport = require('./build-certification-issue-report');

module.exports = function buildCertificationReport({
  id = 123,
  firstName = 'Tiffany',
  lastName = 'Schwarzenegger',
  hasSeenEndTestScreen = false,
  examinerComment,
  certificationIssueReports,
  certificationCourseId = 456,
} = {}) {

  return new CertificationReport({
    id,
    certificationCourseId,
    firstName,
    lastName,
    hasSeenEndTestScreen,
    examinerComment,
    certificationIssueReports: certificationIssueReports
      ? certificationIssueReports
      : [buildCertificationIssueReport({ certificationCourseId })],
  });
};
