import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { OrganizationForUpdate } from '../models/OrganizationForUpdate.js';

const updateOrganizationInformation = withTransaction(async function ({
  userId,
  organization,
  organizationForAdminRepository,
  tagRepository,
  administrationTeamRepository,
  organizationLearnerTypeRepository,
  organizationVerificationService,
  countryRepository,
  structureCategoryRepository,
  learnersApi,
}) {
  const existingOrganization = await organizationForAdminRepository.get({
    organizationId: organization.id,
  });

  let organizationLearnerType;
  if (organization.organizationLearnerType.id) {
    organizationLearnerType = await organizationVerificationService.checkOrganizationLearnerTypeExists(
      organization.organizationLearnerType.id,
      organizationLearnerTypeRepository,
    );
    organization.organizationLearnerType = organizationLearnerType;
  }

  const tagsToUpdate = await tagRepository.findByIds(organization.tagIds);

  await organizationVerificationService.checkAdministrationTeamExists(
    organization.administrationTeamId,
    administrationTeamRepository,
  );

  if (organization.countryCode) {
    await organizationVerificationService.checkCountryExists(organization.countryCode, countryRepository);
  }

  if (organization.categoryId) {
    await organizationVerificationService.checkStructureCategoryExists(
      organization.categoryId,
      structureCategoryRepository,
    );
  }

  const organizationForUpdate = new OrganizationForUpdate(existingOrganization);
  organizationForUpdate.applyInformationUpdate(organization, organization.dataProtectionOfficer, tagsToUpdate);

  if (organizationForUpdate.shouldDeletePreviousLearners) {
    await learnersApi.deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId: organization.id });
  }

  await organizationForAdminRepository.update({
    organization: organizationForUpdate,
  });

  return organizationForAdminRepository.get({
    organizationId: organization.id,
  });
});

export { updateOrganizationInformation };
