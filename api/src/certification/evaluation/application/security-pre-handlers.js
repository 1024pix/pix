import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as checkUserOwnsCertificationCourseUseCase from './usecases/checkUserOwnsCertificationCourse.js';

async function checkUserOwnsCertificationCourse(
  request,
  h,
  dependencies = { checkUserOwnsCertificationCourseUseCase },
) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;

  try {
    const ownsCertificationCourse = await dependencies.checkUserOwnsCertificationCourseUseCase.execute({
      userId,
      certificationCourseId,
    });
    return ownsCertificationCourse ? h.response(true) : securityPreHandlers.replyForbiddenError(h);
  } catch {
    return securityPreHandlers.replyForbiddenError(h);
  }
}

export const evaluationSecurityPreHandlers = {
  checkUserOwnsCertificationCourse,
};
