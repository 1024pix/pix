export default async function findCertificationCenterMembershipsByUser({
  userId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.findByUserId(userId);
}
