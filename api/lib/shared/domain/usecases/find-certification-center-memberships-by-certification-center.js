const findCertificationCenterMembershipsByCertificationCenter = function ({
  certificationCenterId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedById({ certificationCenterId });
};

export { findCertificationCenterMembershipsByCertificationCenter };
