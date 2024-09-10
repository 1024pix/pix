import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { OrganizationLearnerImportFormat } from '../models/OrganizationLearnerImportFormat.js';

/**
 * @param {Object} params
 * @param {Object} params.importFormats
 * @param {OrganizationImportFormat} params.organizationLearnerImportFormatRepository
 * @returns {Promise<void>}
 */
const updateOrganizationLearnerImportFormats = async function ({
  rawImportFormats,
  organizationLearnerImportFormatRepository,
}) {
  const errors = [];
  const organizationLearnerImportFormats = rawImportFormats.flatMap((rawImportFormat) => {
    try {
      return new OrganizationLearnerImportFormat(rawImportFormat);
    } catch (error) {
      errors.push(error);
      return null;
    }
  });

  if (errors.length > 0) {
    throw EntityValidationError.fromMultipleEntityValidationErrors(errors);
  }

  return organizationLearnerImportFormatRepository.updateAllByName({ organizationLearnerImportFormats });
};

export { updateOrganizationLearnerImportFormats };
