module.exports = function createCertificationCenterMembership({ userId, certificationCenterId, certificationCenterMembershipRepository }) {
  return certificationCenterMembershipRepository.save(userId, certificationCenterId);
};
