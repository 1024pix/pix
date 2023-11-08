import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

const getSupervisorKitSessionInfo = async function ({
  userId,
  sessionId,
  sessionRepository,
  sessionForSupervisorKitRepository,
}) {
  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  const sessionForSupervisorKit = await sessionForSupervisorKitRepository.get(sessionId);

  return sessionForSupervisorKit;
};

export { getSupervisorKitSessionInfo };
