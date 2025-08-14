import * as injectedOrganizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import { OrganizationsToAttachToTargetProfile } from '../models/OrganizationsToAttachToTargetProfile.js';

const attachOrganizationsToTargetProfile = async function ({
  targetProfileId,
  organizationIds,
  organizationsToAttachToTargetProfileRepository = injectedOrganizationsToAttachToTargetProfileRepository,
} = {}) {
  const targetProfileOrganizations = new OrganizationsToAttachToTargetProfile({ id: targetProfileId });

  targetProfileOrganizations.attach(organizationIds);

  return organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);
};

export { attachOrganizationsToTargetProfile };
