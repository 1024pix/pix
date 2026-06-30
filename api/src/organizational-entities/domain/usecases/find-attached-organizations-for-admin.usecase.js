/**
 * @typedef {import('../../infrastructure/repositories/organization-for-admin.repository.js')} OrganizationForAdminRepository
 */

/**
 * @param {Object} params
 * @param {OrganizationForAdminRepository} params.organizationForAdminRepository
 * @param {number} params.certificationCenterId
 * @returns {Promise<AttachedOrganization[]>}
 */
const findAttachedOrganizationsForAdmin = async function ({ certificationCenterId, organizationForAdminRepository }) {
  return organizationForAdminRepository.findAttachedByCertificationCenterId({ certificationCenterId });
};

export { findAttachedOrganizationsForAdmin };
