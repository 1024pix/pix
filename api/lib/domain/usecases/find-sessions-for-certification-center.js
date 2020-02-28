const {
  ForbiddenAccess
} = require('../../domain/errors');

module.exports = async function findSessionsForCertificationCenter({
  userId,
  userRepository,
  sessionRepository,
  certificationCenterId,
}) {
  const user = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!user.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess(`User ${userId} is not a member of certification center ${certificationCenterId}`);
  }
  return sessionRepository.findByCertificationCenterId(certificationCenterId);
};
