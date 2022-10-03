module.exports = async function findCertificationCenterMembershipsByUser({
  userId,
  certificationCenterMembershipRepository,
}) {
  return certificationCenterMembershipRepository.findByUserId(userId);
};
