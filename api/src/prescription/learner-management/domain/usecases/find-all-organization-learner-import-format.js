const findAllOrganizationLearnerImportFormats = async ({ organizationLearnerImportFormatRepository }) =>
  await organizationLearnerImportFormatRepository.findAll();

export { findAllOrganizationLearnerImportFormats };
