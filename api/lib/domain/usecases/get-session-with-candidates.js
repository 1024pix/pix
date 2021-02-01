const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getSessionWithCandidates({ userId, sessionId, sessionRepository }) {

  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntity('User is not allowed to access session.');
  }

  return sessionRepository.getWithCertificationCandidates(sessionId);
};
