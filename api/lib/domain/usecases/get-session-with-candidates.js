const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function getSessionWithCandidates({ userId, sessionId, sessionRepository }) {

  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  return sessionRepository.getWithCertificationCandidates(sessionId);
};
