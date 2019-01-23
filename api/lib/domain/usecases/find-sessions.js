const { ForbiddenAccess } = require('../../domain/errors');

module.exports = function findSessions({ userId, certificationCenterId, sessionRepository, userRepository }) {
  return userRepository.getWithCertificationCenterMemberships(userId)
    .then((user) => {
      if(user.hasAccessToCertificationCenter(certificationCenterId)) {
        return sessionRepository.findByCertificationCenter(certificationCenterId);
      }
      throw new ForbiddenAccess(`User ${userId} is not a member of certification center ${certificationCenterId}`);
    });
};
