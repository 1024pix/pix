const OrganizationAccess = require('../../');

module.exports = async function createUserOrganizationAccess({ userId, organizationId, userRepository, organizationRepository }) {
  const [user, organization] = await Promise.all([
    userRepository.get(userId),
    organizationRepository.get(organizationId),
  ]);
  const organizationRole = new
  const organizationAccess = new OrganizationAccess({user, organization})
};
