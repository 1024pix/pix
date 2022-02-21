module.exports = async function manuallyResolveCertificationIssueReport({
  certificationIssueReportId,
  resolution,
  certificationIssueReportRepository,
}) {
  const certificationIssueReport = await certificationIssueReportRepository.get(certificationIssueReportId);
  certificationIssueReport.resolve(resolution);
  await certificationIssueReportRepository.save(certificationIssueReport);
};
