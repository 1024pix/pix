import { NotFoundError } from '../../../src/shared/domain/errors.js';

async function findChildrenOrganizationsForAdmin({ parentOrganizationId, organizationForAdminRepository }) {
  const parentOrganizationExist = await organizationForAdminRepository.exist(parentOrganizationId);

  if (!parentOrganizationExist) {
    throw new NotFoundError(`Organization with ID (${parentOrganizationId}) not found`);
  }

  const children = await organizationForAdminRepository.findChildrenByParentOrganizationId(parentOrganizationId);

  return children;
}

export { findChildrenOrganizationsForAdmin };
