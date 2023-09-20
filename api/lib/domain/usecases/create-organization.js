import { Organization } from '../models/index.js';

const createOrganization = async function ({
  organization,
  dataProtectionOfficerRepository,
  organizationForAdminRepository,
  organizationCreationValidator,
  pix1dOrganizationRepository,
}) {
  organizationCreationValidator.validate(organization);
  const savedOrganization = await organizationForAdminRepository.save(organization);

  await dataProtectionOfficerRepository.create({
    organizationId: savedOrganization.id,
    firstName: organization.dataProtectionOfficer.firstName,
    lastName: organization.dataProtectionOfficer.lastName,
    email: organization.dataProtectionOfficer.email,
  });

  if (savedOrganization.type === Organization.types.SCO1D) {
    await pix1dOrganizationRepository.save({ organizationId: savedOrganization.id });
  }
  return await organizationForAdminRepository.get(savedOrganization.id);
};

export { createOrganization };
