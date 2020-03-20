const { ForbiddenAccess } = require('../../domain/errors');

module.exports = async function findSessionsForCertificationCenter({ 
  userId, 
  certificationCenterId, 
  certificationCenterMembershipRepository,
  sessionRepository, 
}) {
  const hasAccess = await certificationCenterMembershipRepository.doesUserHaveMembershipToCertificationCenter(userId, certificationCenterId);
  if (hasAccess) {
    return sessionRepository.findByCertificationCenterId(certificationCenterId);
  }
  throw new ForbiddenAccess(`User ${userId} is not a member of certification center ${certificationCenterId}`);
};
