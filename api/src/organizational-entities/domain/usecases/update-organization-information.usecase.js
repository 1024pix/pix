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
  // TODO: organizationLearnerType.id is required at creation, no org has it empty in DB — this if could be removed like categoryId's
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

  // TODO: countryCode is required at creation, no org has it empty in DB — this if could be removed like categoryId's
  if (organization.countryCode) {
    await organizationVerificationService.checkCountryExists(organization.countryCode, countryRepository);
  }

  await organizationVerificationService.checkStructureCategoryExists({
    structureCategoryId: organization.categoryId,
    structureCategoryRepository,
  });

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
