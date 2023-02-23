const { CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually } = require('../errors.js');

module.exports = async function manuallyResolveCertificationIssueReport({
  certificationIssueReportId,
  resolution,
  certificationIssueReportRepository,
}) {
  const certificationIssueReport = await certificationIssueReportRepository.get(certificationIssueReportId);
  if (certificationIssueReport.hasBeenAutomaticallyResolved) {
    throw new CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually();
  }

  certificationIssueReport.resolveManually(resolution);
  await certificationIssueReportRepository.save(certificationIssueReport);
};
