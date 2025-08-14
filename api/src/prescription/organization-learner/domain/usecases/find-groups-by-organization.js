import * as injectedGroupRepository from '../../../campaign/infrastructure/repositories/group-repository.js';
const findGroupsByOrganization = async function ({ organizationId, groupRepository = injectedGroupRepository } = {}) {
  return groupRepository.findByOrganizationId({ organizationId });
};

export { findGroupsByOrganization };
