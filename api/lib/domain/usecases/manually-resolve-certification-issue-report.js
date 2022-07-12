module.exports = async function manuallyResolveCertificationIssueReport({
  certificationIssueReportId,
  resolution,
  certificationIssueReportRepository,
}) {
  const certificationIssueReport = await certificationIssueReportRepository.get(certificationIssueReportId);
  certificationIssueReport.resolveManually(resolution);
  await certificationIssueReportRepository.save(certificationIssueReport);
};
