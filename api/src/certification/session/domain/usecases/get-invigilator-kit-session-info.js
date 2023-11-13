/**
 * @typedef {import ('../../../session/infrastructure/repositories/session-repository.js')} sessionRepository
 * @typedef {import ('../../../session/infrastructure/repositories/session-for-invigilator-kit-repository.js')} sessionForInvigilatorKitRepository
 */

import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} deps
 * @param {sessionRepository} deps.sessionRepository
 * @param {sessionForInvigilatorKitRepository} deps.sessionForInvigilatorKitRepository
 */
const getInvigilatorKitSessionInfo = async function ({
  userId,
  sessionId,
  sessionRepository,
  sessionForInvigilatorKitRepository,
}) {
  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  return await sessionForInvigilatorKitRepository.get(sessionId);
};

export { getInvigilatorKitSessionInfo };
