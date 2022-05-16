const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');

module.exports = {
  async isAuthorizedToAccessSession({ userId, sessionId }) {
    const hasMembershipAccess = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
      userId,
      sessionId
    );
    if (!hasMembershipAccess) {
      const isSuperAdmin = await userRepository.isSuperAdmin(userId);
      const isSupport = await userRepository.isSupport(userId);
      const isCertif = await userRepository.isCertif(userId);
      const hasRights = isSuperAdmin || isSupport || isCertif;
      if (!hasRights) {
        return false;
      }
    }

    return true;
  },
};
