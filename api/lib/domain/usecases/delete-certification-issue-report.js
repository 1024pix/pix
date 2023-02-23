const { ForbiddenAccess } = require('../errors.js');

module.exports = async function deleteCertificationIssueReport({
  certificationIssueReportId,
  certificationCourseRepository,
  certificationIssueReportRepository,
  sessionRepository,
}) {
  const certificationIssueReport = await certificationIssueReportRepository.get(certificationIssueReportId);
  const certificationCourse = await certificationCourseRepository.get(certificationIssueReport.certificationCourseId);
  const isFinalized = await sessionRepository.isFinalized(certificationCourse.getSessionId());

  if (isFinalized) {
    throw new ForbiddenAccess('Certification issue report deletion forbidden');
  }

  return certificationIssueReportRepository.delete(certificationIssueReportId);
};
