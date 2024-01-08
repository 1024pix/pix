import { NotFoundError } from '../errors.js';

async function findChildrenOrganizationsForAdmin({ parentOrganizationId, organizationRepository }) {
  const parentOrganizationExist = await organizationRepository.exist(parentOrganizationId);

  if (!parentOrganizationExist) {
    throw new NotFoundError(`Organization with ID (${parentOrganizationId}) not found`);
  }

  const children = await organizationRepository.findChildrenByParentOrganizationId(parentOrganizationId);

  return children;
}

export { findChildrenOrganizationsForAdmin };
