import { ParentOrganizationNotInNetworkError } from '../errors.js';
import { Organization } from '../models/Organization.js';

const createOrganization = async function ({
  organization,
  administrationTeamRepository,
  countryRepository,
  dataProtectionOfficerRepository,
  organizationForAdminRepository,
  organizationLearnerTypeRepository,
  organizationCreationValidator,
  schoolRepository,
  accessCodeGenerator,
  organizationVerificationService,
}) {
  if (organization.parentOrganizationId) {
    const parentOrganization = await organizationForAdminRepository.get({
      organizationId: organization.parentOrganizationId,
    });

    _assertParentOrganizationBelongsToNetwork(parentOrganization);
  }

  organizationCreationValidator.validate(organization);

  await organizationVerificationService.checkOrganizationLearnerTypeExists(
    organization.organizationLearnerType.id,
    organizationLearnerTypeRepository,
  );

  await organizationVerificationService.checkCountryExists(organization.countryCode, countryRepository);

  await organizationVerificationService.checkAdministrationTeamExists(
    organization.administrationTeamId,
    administrationTeamRepository,
  );

  const savedOrganization = await organizationForAdminRepository.save({
    organization,
  });

  await dataProtectionOfficerRepository.create({
    organizationId: savedOrganization.id,
    firstName: organization.dataProtectionOfficer.firstName,
    lastName: organization.dataProtectionOfficer.lastName,
    email: organization.dataProtectionOfficer.email,
  });

  if (savedOrganization.type === Organization.types.SCO1D) {
    const code = await accessCodeGenerator.generateAvailableAccessCode((code) =>
      schoolRepository.isCodeAvailable({ code }),
    );
    await schoolRepository.save({ organizationId: savedOrganization.id, code });
  }
  return await organizationForAdminRepository.get({
    organizationId: savedOrganization.id,
  });
};

export { createOrganization };

function _assertParentOrganizationBelongsToNetwork(parentOrganization) {
  if (!parentOrganization.network.id) {
    throw new ParentOrganizationNotInNetworkError({ meta: { parentOrganizationId: parentOrganization.id } });
  }
}
