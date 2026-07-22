/**
 * @typedef {import ('./index.js').OrganizationForAdminRepository} OrganizationForAdminRepository
 */

import { OrganizationNotFound } from '../errors.js';

/**
 * @param {object} params
 * @param {number} params.organizationId
 * @param {OrganizationForAdminRepository} params.organizationForAdminRepository
 * @returns {Promise<void>}
 */
export const detachCertificationCenterFromOrganization = async function ({
  organizationId,
  organizationForAdminRepository,
}) {
  const existingOrganization = await organizationForAdminRepository.exist({ organizationId });
  if (!existingOrganization) {
    throw new OrganizationNotFound({
      code: 'ORGANIZATION_NOT_FOUND',
      message: 'Organization does not exist',
      meta: { organizationId },
    });
  }

  await organizationForAdminRepository.detachCertificationCenter({ organizationId });
};
