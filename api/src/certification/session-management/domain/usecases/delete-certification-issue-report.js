import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import { certificationIssueReportRepository as injectedCertificationIssueReportRepository } from '../../infrastructure/repositories/index.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';

const deleteCertificationIssueReport = async function ({
  certificationIssueReportId,
  certificationCourseRepository = injectedCertificationCourseRepository,
  certificationIssueReportRepository = injectedCertificationIssueReportRepository,
  sessionRepository = injectedSessionRepository,
} = {}) {
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
