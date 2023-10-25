const findCertificationCenterMembershipsByCertificationCenter = function ({
  certificationCenterId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedByRole({
    certificationCenterId,
  });
};

export { findCertificationCenterMembershipsByCertificationCenter };
