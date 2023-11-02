const updateOrganizationInformation = async function ({
  organization,
  organizationForAdminRepository,
  tagRepository,
  domainTransaction,
}) {
  const existingOrganization = await organizationForAdminRepository.get(organization.id, domainTransaction);
  const tagsToUpdate = await tagRepository.findByIds(organization.tagIds, domainTransaction);

  existingOrganization.updateWithDataProtectionOfficerAndTags(
    organization,
    organization.dataProtectionOfficer,
    tagsToUpdate,
  );

  await organizationForAdminRepository.update(existingOrganization, domainTransaction);

  return organizationForAdminRepository.get(organization.id, domainTransaction);
};

export { updateOrganizationInformation };
