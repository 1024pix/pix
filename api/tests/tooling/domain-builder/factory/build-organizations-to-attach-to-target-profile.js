import { OrganizationsToAttachToTargetProfile } from '../../../../src/prescription/target-profile/domain/models/OrganizationsToAttachToTargetProfile.js';

const buildOrganizationsToAttachToTargetProfile = function ({ id = 123 } = {}) {
  return new OrganizationsToAttachToTargetProfile({
    id,
  });
};

export { buildOrganizationsToAttachToTargetProfile };
