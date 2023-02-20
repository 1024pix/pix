export default async function disableCertificationCenterMembership({
  certificationCenterMembershipId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.disableById({ certificationCenterMembershipId });
}
