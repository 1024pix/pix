module.exports = ({ userId, certificationCenterMembershipRepository }) => {
  return certificationCenterMembershipRepository.findByUserId(userId);
};
