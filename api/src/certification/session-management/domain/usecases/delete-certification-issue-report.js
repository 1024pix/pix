import { ForbiddenAccess } from '../../../../shared/domain/errors.js';

const deleteCertificationIssueReport = async function ({
  certificationIssueReportId,
  certificationCourseRepository,
  certificationIssueReportRepository,
  sessionRepository,
}) {
  const certificationIssueReport = await certificationIssueReportRepository.get({ id: certificationIssueReportId });
  const sessionId = await certificationCourseRepository.getSessionId({
    id: certificationIssueReport.certificationCourseId,
  });
  const isFinalized = await sessionRepository.isFinalized({ id: sessionId });

  if (isFinalized) {
    throw new ForbiddenAccess('Certification issue report deletion forbidden');
  }

  return certificationIssueReportRepository.remove({ id: certificationIssueReportId });
};

export { deleteCertificationIssueReport };
