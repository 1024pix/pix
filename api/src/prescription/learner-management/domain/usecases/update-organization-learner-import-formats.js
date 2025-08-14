import { readFile } from 'node:fs/promises';

import { EntityValidationError, FileValidationError } from '../../../../shared/domain/errors.js';
import * as injectedOrganizationLearnerImportFormatRepository from '../../infrastructure/repositories/organization-learner-import-format-repository.js';
import { OrganizationLearnerImportFormat } from '../models/OrganizationLearnerImportFormat.js';
/**
 * @param {Object} params
 * @param {Object} params.importFormats
 * @param {OrganizationLearnerImportFormatRepository} params.organizationLearnerImportFormatRepository
 * @returns {Promise<void>}
 */
const updateOrganizationLearnerImportFormats = async function ({
  payload,
  organizationLearnerImportFormatRepository = injectedOrganizationLearnerImportFormatRepository,
  dependencies = { readFile, jsonParse: JSON.parse },
} = {}) {
  const errors = [];
  let rawImportFormats;
  try {
    const buffer = await dependencies.readFile(payload.path);
    rawImportFormats = dependencies.jsonParse(buffer);
  } catch (error) {
    throw new FileValidationError(error);
  }

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
