const {
  ForbiddenAccess
} = require('../../domain/errors');

module.exports = async function findSessionsForCertificationCenter({
  userId,
  userRepository,
  sessionRepository,
  certificationCenterId,
  filter,
  page,
}) {
  const user = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!user.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess(`User ${userId} is not a member of certification center ${certificationCenterId}`);
  }

  // Ensure the client can't ask too many collections by toying with the url
  if (page.size < 10) page.size = 10;
  if (page.size > 100) page.size = 100;

  return sessionRepository.findPaginatedSessions({
    certificationCenterId, filter, page
  });
};
