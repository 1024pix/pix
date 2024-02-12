import { ForbiddenAccess } from '../../../src/shared/domain/errors.js';

const deleteCertificationIssueReport = async function ({
  certificationIssueReportId,
  certificationCourseRepository,
  certificationIssueReportRepository,
  sessionRepository,
}) {
  const certificationIssueReport = await certificationIssueReportRepository.get(certificationIssueReportId);
  const sessionId = await certificationCourseRepository.getSessionId(certificationIssueReport.certificationCourseId);
  const isFinalized = await sessionRepository.isFinalized(sessionId);

  if (isFinalized) {
    throw new ForbiddenAccess('Certification issue report deletion forbidden');
  }

  return certificationIssueReportRepository.remove(certificationIssueReportId);
};

export { deleteCertificationIssueReport };
