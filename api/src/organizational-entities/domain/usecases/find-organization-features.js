/**
 * @typedef {import ('./index.js').OrganizationFeatureRepository} OrganizationFeatureRepository
 */
/**
 * @typedef {import ('../models/OrganizationFeatureItem.js')} OrganizationFeatureItem
 */

/**
 * @param {Object} params - A parameter object.
 * @param {string} params.organizationId - feature id to add.
 * @param {OrganizationFeatureRepository} params.organizationFeatureRepository - organizationRepository to use.
 * @returns {Promise<OrganizationFeatureItem>}
 */
export const findOrganizationFeatures = async function ({ organizationId, organizationFeatureRepository }) {
  return organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({ organizationId });
};
