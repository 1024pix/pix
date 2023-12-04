/**
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionRepository} SessionRepository
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 */

import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionForInvigilatorKitRepository} params.sessionForInvigilatorKitRepository
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
