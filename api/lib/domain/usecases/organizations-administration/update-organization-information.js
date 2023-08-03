const updateOrganizationInformation = async function ({ organization, organizationForAdminRepository }) {
  const existingOrganization = await organizationForAdminRepository.get(organization.id);

  existingOrganization.updateInformation(organization, organization.dataProtectionOfficer, organization.tags);

  await organizationForAdminRepository.update(existingOrganization);

  return organizationForAdminRepository.get(organization.id);
};

export { updateOrganizationInformation };
