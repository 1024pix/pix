const { ForbiddenAccess } = require('../errors');

module.exports = async function deleteCertificationIssueReport({
  certificationIssueReportId,
  userId,
  certificationCourseRepository,
  certificationIssueReportRepository,
  sessionRepository,
  sessionAuthorizationService,
}) {
  const certificationIssueReport = await certificationIssueReportRepository.get(certificationIssueReportId);

  const certificationCourse = await certificationCourseRepository.get(certificationIssueReport.certificationCourseId);

  const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({
    userId,
    sessionId: certificationCourse.getSessionId(),
  });
  if (!isAuthorized) {
    throw new ForbiddenAccess('Certification issue report deletion forbidden');
  }
  const isFinalized = await sessionRepository.isFinalized(certificationCourse.getSessionId());
  if (isFinalized) {
    throw new ForbiddenAccess('Certification issue report deletion forbidden');
  }

  return certificationIssueReportRepository.delete(certificationIssueReportId);
};
