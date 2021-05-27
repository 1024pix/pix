const { NotFoundError } = require('../errors');
const CertificationIssueReport = require('../models/CertificationIssueReport');

module.exports = async function saveCertificationIssueReport({
  userId,
  certificationIssueReportDTO,
  certificationCourseRepository,
  certificationIssueReportRepository,
  sessionAuthorizationService,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationIssueReportDTO.certificationCourseId);

  const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId: certificationCourse.sessionId });
  if (!isAuthorized) {
    throw new NotFoundError('Erreur lors de la sauvegarde du signalement. Veuillez vous connecter et réessayer.');
  }

  const certificationIssueReport = CertificationIssueReport.create(certificationIssueReportDTO);
  return certificationIssueReportRepository.save(certificationIssueReport);
};
