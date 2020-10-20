const { ForbiddenAccess } = require('../../domain/errors');
const { NotFoundError } = require('../../domain/errors');

module.exports = async function findStudentsFromCertificationCenterId({
  userId,
  certificationCenterId,
  organizationRepository,
  schoolingRegistrationRepository,
  certificationCenterMembershipRepository,
}) {
  const hasAccess = await certificationCenterMembershipRepository.doesUserHaveMembershipToCertificationCenter(userId, certificationCenterId);
  if (!hasAccess) throw new ForbiddenAccess(`User ${userId} is not a member of certification center ${certificationCenterId}`);

  try {
    const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
    return schoolingRegistrationRepository.findByOrganizationIdOrderByDivision({ organizationId });
  } catch (error) {
    if (error instanceof NotFoundError) return [];
    throw error;
  }
};
