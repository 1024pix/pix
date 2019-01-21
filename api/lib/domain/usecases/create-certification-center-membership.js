module.exports = function createCertificationCenterMembership({ userId, certificationCenterId, certificationCenterMembershipRepository }) {
  return certificationCenterMembershipRepository.create(userId, certificationCenterId);
};
