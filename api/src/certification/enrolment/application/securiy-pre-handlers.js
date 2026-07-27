import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as checkUserIsCandidateUseCase from './usecases/check-user-is-candidate.js';

async function checkUserIsCandidate(
  request,
  h,
  dependencies = {
    checkUserIsCandidateUseCase,
  },
) {
  const userId = request.auth.credentials.userId;
  const certificationCandidateId = request.params.certificationCandidateId;

  const isUserCandidate = await dependencies.checkUserIsCandidateUseCase.execute({ userId, certificationCandidateId });

  if (!isUserCandidate) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  return h.response(true);
}

export const enrolmentSecurityPreHandlers = { checkUserIsCandidate };
