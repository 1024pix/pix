import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as securityRepository from '../infrastructure/repositories/security-repository.js';

async function checkUserOwnsCertificationCourse(request, h, dependencies = { securityRepository }) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const certificationId = request.params.certificationCourseId;

  const isLinkedToUser = await dependencies.securityRepository.isCertificationLinkedToUser({ certificationId, userId });
  return isLinkedToUser ? h.response(true) : securityPreHandlers.replyForbiddenError(h);
}

export const evaluationSecurityPreHandlers = {
  checkUserOwnsCertificationCourse,
};
