import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

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
