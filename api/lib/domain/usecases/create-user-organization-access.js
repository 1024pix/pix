const OrganizationAccess = require('../models/OrganizationAccess');

module.exports = async function createUserOrganizationAccess({ userId, organizationId, userRepository, organizationRepository, organizationRoleRepository, organizationAccessRepository }) {
  const [user, organization, organizationRole] = await Promise.all([
    userRepository.get(userId),
    organizationRepository.get(organizationId),
    organizationRoleRepository.getByName('ADMIN')
  ]);
  const organizationAccess = new OrganizationAccess({ user, organization, organizationRole });
  return organizationAccessRepository.create(organizationAccess);
};
