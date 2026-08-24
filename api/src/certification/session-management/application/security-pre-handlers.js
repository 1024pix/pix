import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as certificationIssueReportRepository from '../../shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as checkUserIsMemberOfCertificationCenterSessionUsecase from './usecases/checkUserIsMemberOfCertificationCenterSession.js';

async function checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
  request,
  h,
  dependencies = { checkUserIsMemberOfCertificationCenterSessionUsecase, certificationIssueReportRepository },
) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const certificationIssueReportId = request.params.id;

  try {
    const certificationIssueReport = await dependencies.certificationIssueReportRepository.get({
      id: certificationIssueReportId,
    });
    const isMemberOfSession = await dependencies.checkUserIsMemberOfCertificationCenterSessionUsecase.execute({
      userId,
      certificationCourseId: certificationIssueReport.certificationCourseId,
    });
    return isMemberOfSession ? h.response(true) : securityPreHandlers.replyForbiddenError(h);
  } catch {
    return securityPreHandlers.replyForbiddenError(h);
  }
}

async function checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
  request,
  h,
  dependencies = {
    checkUserIsMemberOfCertificationCenterSessionUsecase,
  },
) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;

  try {
    const isMemberOfSession = await dependencies.checkUserIsMemberOfCertificationCenterSessionUsecase.execute({
      userId,
      certificationCourseId,
    });
    return isMemberOfSession ? h.response(true) : securityPreHandlers.replyForbiddenError(h);
  } catch {
    return securityPreHandlers.replyForbiddenError(h);
  }
}

export const sessionManagementSecurityPreHandlers = {
  checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId,
  checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId,
};
