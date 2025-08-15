import { NotFoundError } from '../../../shared/domain/errors.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

async function findChildrenOrganizations({
  parentOrganizationId,
  organizationForAdminRepository = injectedRepositories.organizationForAdminRepository,
} = {}) {
  const parentOrganizationExist = await organizationForAdminRepository.exist({ organizationId: parentOrganizationId });

  if (!parentOrganizationExist) {
    throw new NotFoundError(`Organization with ID (${parentOrganizationId}) not found`);
  }

  const children = await organizationForAdminRepository.findChildrenByParentOrganizationId({ parentOrganizationId });

  return children;
}

export { findChildrenOrganizations };
