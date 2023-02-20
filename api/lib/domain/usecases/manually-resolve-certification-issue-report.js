import { CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually } from '../errors';

export default async function manuallyResolveCertificationIssueReport({
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
}
