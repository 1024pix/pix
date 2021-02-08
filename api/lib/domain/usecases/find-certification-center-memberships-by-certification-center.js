module.exports = function findCertificationCenterMembershipsByCertificationCenter({
  certificationCenterId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.findByCertificationCenterId(certificationCenterId);
};
