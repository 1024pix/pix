import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as checkUserOwnsCertificationCourseUseCase from './usecases/checkUserOwnsCertificationCourse.js';

// bounded-context: it duplicates api/src/certification/evaluation/application/security-pre-handlers.js.
// This one should be based on assessment-results (update checkUserOwnsCertificationCourseUseCase in this context and its tests)
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

export const resultsSecurityPreHandlers = {
  checkUserOwnsCertificationCourse,
};
