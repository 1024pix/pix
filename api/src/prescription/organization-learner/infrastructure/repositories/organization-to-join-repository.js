import { OrganizationToJoin } from '../../domain/models/OrganizationToJoin.js';

import * as injectedOrganizationApi from '../../../../organizational-entities/application/api/organization-api.js';import * as injectedOrganizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';

export async function get(
  { id, organizationApi = injectedOrganizationApi, organizationLearnerImportFormatRepository = injectedOrganizationLearnerImportFormatRepository } = {},
) {
  const organization = await organizationApi.getOrganization(id);
  const organizationLearnerImportFormat = await organizationLearnerImportFormatRepository.get(id);

  return new OrganizationToJoin({
    ...organization,
    organizationLearnerImportFormat,
  });
}
