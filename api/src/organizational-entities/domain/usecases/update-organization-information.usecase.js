import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

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

  existingOrganization.updateWithDataProtectionOfficerAndTags(
    organization,
    organization.dataProtectionOfficer,
    tagsToUpdate,
  );

  if (existingOrganization.shouldDeletePreviousLearners) {
    await learnersApi.deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId: organization.id });
  }

  await organizationForAdminRepository.update({
    organization: existingOrganization,
  });

  return organizationForAdminRepository.get({
    organizationId: organization.id,
  });
});

export { updateOrganizationInformation };
