module.exports = function createMembership({ membershipRepository, userId, organizationId, organizationRoleId = 1 }) {
  return membershipRepository.create(userId, organizationId, organizationRoleId);
};
