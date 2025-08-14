import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';
import { tagRepository as injectedTagRepository } from '../../infrastructure/repositories/tag.repository.js';

const updateOrganizationInformation = async function ({
  organization,
  organizationForAdminRepository = organizationalEntitiesRepositories.organizationForAdminRepository,
  tagRepository = injectedTagRepository,
} = {}) {
  const existingOrganization = await organizationForAdminRepository.get({ organizationId: organization.id });
  const tagsToUpdate = await tagRepository.findByIds(organization.tagIds);

  existingOrganization.updateWithDataProtectionOfficerAndTags(
    organization,
    organization.dataProtectionOfficer,
    tagsToUpdate,
  );

  await organizationForAdminRepository.update({ organization: existingOrganization });

  return organizationForAdminRepository.get({ organizationId: organization.id });
};

export { updateOrganizationInformation };
