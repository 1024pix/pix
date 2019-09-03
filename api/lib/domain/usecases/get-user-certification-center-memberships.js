module.exports = function getUserCertificationCenterMemberships({ userId, certificationCenterMembershipRepository }) {
  return certificationCenterMembershipRepository.findByUserId(userId);
};
