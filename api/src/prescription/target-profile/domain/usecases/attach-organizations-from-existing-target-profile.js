import * as injectedOrganizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import * as injectedTargetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
import { OrganizationsToAttachToTargetProfile } from '../models/OrganizationsToAttachToTargetProfile.js';

const attachOrganizationsFromExistingTargetProfile = async function ({
  targetProfileId,
  existingTargetProfileId,
  organizationsToAttachToTargetProfileRepository = injectedOrganizationsToAttachToTargetProfileRepository,
  targetProfileRepository = injectedTargetProfileRepository,
} = {}) {
  const targetProfileOrganizations = new OrganizationsToAttachToTargetProfile({ id: targetProfileId });
  const organizationIds = await targetProfileRepository.findOrganizationIds(existingTargetProfileId);

  targetProfileOrganizations.attach(organizationIds);

  await organizationsToAttachToTargetProfileRepository.attachOrganizations(targetProfileOrganizations);
};

export { attachOrganizationsFromExistingTargetProfile };
