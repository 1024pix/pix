import * as injectedOrganizationMemberIdentityRepository from '../../infrastructure/repositories/organization-member-identity.repository.js';
const getOrganizationMemberIdentities = function ({
  organizationId,
  organizationMemberIdentityRepository = injectedOrganizationMemberIdentityRepository,
} = {}) {
  return organizationMemberIdentityRepository.findAllByOrganizationId({ organizationId });
};

export { getOrganizationMemberIdentities };
