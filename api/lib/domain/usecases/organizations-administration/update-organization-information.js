const updateOrganizationInformation = async function ({
  organization,
  organizationForAdminRepository,
  domainTransaction,
}) {
  const existingOrganization = await organizationForAdminRepository.get(organization.id, domainTransaction);

  existingOrganization.updateWithDataProtectionOfficerAndTags(
    organization,
    organization.dataProtectionOfficer,
    organization.tags,
  );

  await organizationForAdminRepository.update(existingOrganization, domainTransaction);

  return organizationForAdminRepository.get(organization.id, domainTransaction);
};

export { updateOrganizationInformation };
