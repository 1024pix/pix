import { CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually } from '../../domain/errors.js';

export async function manuallyResolveCertificationIssueReport({
  certificationIssueReportId,
  resolution,
  certificationIssueReportRepository,
}) {
  const certificationIssueReport = await certificationIssueReportRepository.get({ id: certificationIssueReportId });
  if (certificationIssueReport.hasBeenAutomaticallyResolved) {
    throw new CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually();
  }

  certificationIssueReport.resolveManually(resolution);
  await certificationIssueReportRepository.save({ certificationIssueReport });
}
