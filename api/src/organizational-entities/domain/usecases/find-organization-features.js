import * as injectedOrganizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js'; /**
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
export const findOrganizationFeatures = async function ({
  organizationId,
  organizationFeatureRepository = injectedOrganizationFeatureRepository,
} = {}) {
  return organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({ organizationId });
};
