module.exports = function findCertificationCenterMembershipsByCertificationCenter({
  certificationCenterId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.findActiveByCertificationCenterId(certificationCenterId);
};
