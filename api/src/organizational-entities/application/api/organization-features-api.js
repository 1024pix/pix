import * as organizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js';
import { OrganizationFeatureItemDTO } from './OrganizationFeatureItemDTO.js';
import { OrganizationFeaturesDTO } from './OrganizationFeaturesDTO.js';

/**
 * @module OrganizationFeaturesApi
 */

/**
 * @typedef {import('../../infrastructure/repositories/organization-feature-repository.js')} OrganizationFeatureRepository
 */

/**
 * @typedef OrganizationFeatureItemDTO
 * @type {object}
 * @property {string} name
 * @property {object | Array<string>}params
 */

/**
 * @typedef OrganizationFeaturesDTO
 * @type {object}
 * @property {Array<OrganizationFeatureItemDTO>} features
 * @property {boolean} hasLearnersImportFeature
 * @property {boolean} hasOralizationFeature
 */

/**
 * @function
 * @name getAllFeaturesFromOrganization
 *
 * @param {number} organizationId
 * @param {Object} [dependencies]
 * @param {OrganizationFeatureRepository} [dependencies.organizationFeatureRepository]
 * @returns {Promise<OrganizationFeaturesDTO>}
 */
export const getAllFeaturesFromOrganization = async (
  organizationId,
  dependencies = { organizationFeatureRepository },
) => {
  const organizationFeatures =
    await dependencies.organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({ organizationId });

  return new OrganizationFeaturesDTO({
    features: organizationFeatures.map((organizationFeature) => new OrganizationFeatureItemDTO(organizationFeature)),
  });
};
