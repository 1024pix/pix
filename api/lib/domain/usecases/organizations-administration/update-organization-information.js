const updateOrganizationInformation = async function ({ organization, organizationForAdminRepository, tagRepository }) {
  const existingOrganization = await organizationForAdminRepository.get(organization.id);
  const tagsToUpdate = await tagRepository.findByIds(organization.tagIds);

  existingOrganization.updateWithDataProtectionOfficerAndTags(
    organization,
    organization.dataProtectionOfficer,
    tagsToUpdate,
  );

  await organizationForAdminRepository.update(existingOrganization);

  return organizationForAdminRepository.get(organization.id);
};

export { updateOrganizationInformation };
