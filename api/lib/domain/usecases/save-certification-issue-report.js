const CertificationIssueReport = require('../models/CertificationIssueReport');

module.exports = async function saveCertificationIssueReport({
  certificationIssueReportDTO,
  certificationIssueReportRepository,
}) {
  const certificationIssueReport = CertificationIssueReport.create(certificationIssueReportDTO);
  return certificationIssueReportRepository.save(certificationIssueReport);
};
