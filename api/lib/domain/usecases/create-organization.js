import { Organization } from '../../../src/shared/domain/models/index.js';

const createOrganization = async function ({
  organization,
  dataProtectionOfficerRepository,
  organizationForAdminRepository,
  organizationCreationValidator,
  schoolRepository,
  codeGenerator,
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
    const code = await codeGenerator.generate(schoolRepository);
    await schoolRepository.save({ organizationId: savedOrganization.id, code });
  }
  return await organizationForAdminRepository.get(savedOrganization.id);
};

export { createOrganization };
