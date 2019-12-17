const sessionRepository = require('../../infrastructure/repositories/session-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');

module.exports = {

  async isAuthorizedToAccessSession({ userId, sessionId }) {
    const hasMembershipAccess = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
    if (!hasMembershipAccess) {
      const isPixMaster = await userRepository.hasRolePixMaster(userId);
      if (!isPixMaster) {
        return false;
      }
    }

    return true;
  }
};
