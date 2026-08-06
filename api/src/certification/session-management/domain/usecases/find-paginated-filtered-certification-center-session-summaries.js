import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';

const findPaginatedFilteredCertificationCenterSessionSummaries = async function ({
  userId,
  certificationCenterId,
  filters,
  page,
  sessionSummaryRepository,
  certificationCenterMembershipRepository,
}) {
  const isMember = await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
    userId,
    certificationCenterId,
  });
  if (!isMember) {
    throw new ForbiddenAccess(`User ${userId} is not a member of certification center ${certificationCenterId}`);
  }

  return sessionSummaryRepository.findPaginatedFilteredByCertificationCenterId({
    certificationCenterId,
    filters,
    page,
  });
};

export { findPaginatedFilteredCertificationCenterSessionSummaries };
