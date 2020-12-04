const _ = require('lodash');
const { InvalidCertificationIssueReportForSaving } = require('../errors');

module.exports = async function saveCertificationIssueReport({
  certificationIssueReport,
  certificationCourseRepository,
  certificationIssueReportRepository,
}) {
  certificationIssueReport.validateForSaving();

  const certificationCourse = await certificationCourseRepository.get(certificationIssueReport.certificationCourseId);
  if (!certificationCourse) {
    throw new InvalidCertificationIssueReportForSaving('Il y a un soucis avec l\'identification de cette certification, impossible de sauvegarder le signalement.');
  }

  return certificationIssueReportRepository.save(certificationIssueReport);
};
