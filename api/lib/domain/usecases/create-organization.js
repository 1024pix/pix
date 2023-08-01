const createOrganization = async function ({
  organization,
  dataProtectionOfficerRepository,
  organizationForAdminRepository,
  organizationCreationValidator,
}) {
  organizationCreationValidator.validate(organization);
  const createdOrganization = await organizationForAdminRepository.save(organization);

  await dataProtectionOfficerRepository.create({
    organizationId: createdOrganization.id,
    firstName: organization.dataProtectionOfficer.firstName,
    lastName: organization.dataProtectionOfficer.lastName,
    email: organization.dataProtectionOfficer.email,
  });

  return organizationForAdminRepository.get(createdOrganization.id);
};

export { createOrganization };
