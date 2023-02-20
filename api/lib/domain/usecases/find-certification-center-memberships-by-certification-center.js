export default function findCertificationCenterMembershipsByCertificationCenter({
  certificationCenterId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedById({ certificationCenterId });
}
