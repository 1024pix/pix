const findCertificationCenterMembershipsByUser = async function ({ userId, certificationCenterMembershipRepository }) {
  return certificationCenterMembershipRepository.findByUserId(userId);
};

export { findCertificationCenterMembershipsByUser };
