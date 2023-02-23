const { ForbiddenAccess } = require('../../domain/errors.js');

module.exports = async function findPaginatedCertificationCenterSessionSummaries({
  userId,
  certificationCenterId,
  page,
  sessionSummaryRepository,
  userRepository,
}) {
  const user = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!user.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess(`User ${userId} is not a member of certification center ${certificationCenterId}`);
  }

  return sessionSummaryRepository.findPaginatedByCertificationCenterId({ certificationCenterId, page });
};
