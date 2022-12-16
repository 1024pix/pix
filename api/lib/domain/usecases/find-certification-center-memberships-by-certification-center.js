module.exports = function findCertificationCenterMembershipsByCertificationCenter({
  certificationCenterId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedById({ certificationCenterId });
};
