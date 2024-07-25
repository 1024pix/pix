import { CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually } from '../../../src/shared/domain/errors.js';

const manuallyResolveCertificationIssueReport = async function ({
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
};

export { manuallyResolveCertificationIssueReport };
