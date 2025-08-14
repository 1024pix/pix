import * as injectedSchoolRepository from '../../../school/infrastructure/repositories/school-repository.js';
import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';
import { Organization } from '../models/Organization.js';

const getOrganizationDetails = async function ({
  organizationId,
  organizationForAdminRepository = organizationalEntitiesRepositories.organizationForAdminRepository,
  schoolRepository = injectedSchoolRepository,
} = {}) {
  const organization = await organizationForAdminRepository.get({ organizationId });
  if (organization.type === Organization.types.SCO1D) {
    organization.code = await schoolRepository.getById({ organizationId });
  }
  return organization;
};

export { getOrganizationDetails };
