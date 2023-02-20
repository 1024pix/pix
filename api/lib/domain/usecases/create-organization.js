import organizationCreationValidator from '../validators/organization-creation-validator';

export default async function createOrganization({
  organization,
  dataProtectionOfficerRepository,
  organizationForAdminRepository,
}) {
  organizationCreationValidator.validate(organization);
  const createdOrganization = await organizationForAdminRepository.save(organization);

  const dataProtectionOfficer = await dataProtectionOfficerRepository.create({
    organizationId: createdOrganization.id,
    firstName: organization.dataProtectionOfficerFirstName,
    lastName: organization.dataProtectionOfficerLastName,
    email: organization.dataProtectionOfficerEmail,
  });

  createdOrganization.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
  createdOrganization.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
  createdOrganization.dataProtectionOfficerEmail = dataProtectionOfficer.email;

  return createdOrganization;
}
