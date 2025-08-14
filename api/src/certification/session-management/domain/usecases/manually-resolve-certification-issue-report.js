import { CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually } from '../../domain/errors.js';
import { certificationIssueReportRepository as injectedCertificationIssueReportRepository } from '../../infrastructure/repositories/index.js';

const manuallyResolveCertificationIssueReport = async function ({
  certificationIssueReportId,
  resolution,
  certificationIssueReportRepository = injectedCertificationIssueReportRepository,
} = {}) {
  const certificationIssueReport = await certificationIssueReportRepository.get({ id: certificationIssueReportId });
  if (certificationIssueReport.hasBeenAutomaticallyResolved) {
    throw new CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually();
  }

  certificationIssueReport.resolveManually(resolution);
  await certificationIssueReportRepository.save({ certificationIssueReport });
};

export { manuallyResolveCertificationIssueReport };
