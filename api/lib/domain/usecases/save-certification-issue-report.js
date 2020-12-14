const { InvalidCertificationIssueReportForSaving, NotFoundError } = require('../errors');

module.exports = async function saveCertificationIssueReport({
  userId,
  certificationIssueReport,
  certificationCourseRepository,
  certificationIssueReportRepository,
  sessionAuthorizationService,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationIssueReport.certificationCourseId);
  if (!certificationCourse) {
    throw new InvalidCertificationIssueReportForSaving('Il y a un soucis avec l\'identification de cette certification, impossible de sauvegarder le signalement.');
  }

  const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId: certificationCourse.sessionId });
  if (!isAuthorized) {
    throw new NotFoundError('Erreur lors de la sauvegarde du signalement. Veuillez vous connecter et réessayer.');
  }

  certificationIssueReport.validateForSaving();

  return certificationIssueReportRepository.save(certificationIssueReport);
};
