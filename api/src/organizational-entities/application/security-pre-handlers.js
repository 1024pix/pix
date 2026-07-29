import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import * as checkCertificationCenterIsScoManagingStudentsUsecase from './usecases/checkCertificationCenterIsScoManagingStudents.js';

async function checkCertificationCenterIsNotScoManagingStudents(
  request,
  h,
  dependencies = { checkCertificationCenterIsScoManagingStudentsUsecase },
) {
  if (!request?.auth?.credentials || !request.auth.credentials.userId) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  const certificationCenterId =
    request?.params?.certificationCenterId || request?.payload?.data?.attributes?.certificationCenterId;

  const isScoManagingStudent = await dependencies.checkCertificationCenterIsScoManagingStudentsUsecase.execute({
    certificationCenterId,
  });

  if (isScoManagingStudent) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  return h.response(true);
}

export const organizationalEntitiesSecurityPreHandlers = {
  checkCertificationCenterIsNotScoManagingStudents,
};
