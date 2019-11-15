const { roles } = require('../models/Membership');

module.exports = async function createMembership({ membershipRepository, userId, organizationId }) {
  const memberships = await membershipRepository.findByOrganizationId({ organizationId });
  const organizationRole =  memberships.length ? roles.MEMBER : roles.ADMIN;

  return membershipRepository.create(userId, organizationId, organizationRole);
};
