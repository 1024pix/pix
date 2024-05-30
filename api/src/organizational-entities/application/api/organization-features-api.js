import { usecases } from '../../domain/usecases/index.js';
import { OrganizationFeatureItemDTO } from './OrganizationFeatureItemDTO.js';
import { OrganizationFeaturesDTO } from './OrganizationFeaturesDTO.js';

/**
 * @module OrganizationFeaturesApi
 */

/**
 * @typedef {import ('./OrganizationFeaturesDTO.js').OrganizationFeaturesDTO} OrganizationFeaturesDTO
 */

/**
 * @function
 * @name getAllFeaturesFromOrganization
 *
 * @param {number} organizationId
 * @returns {Promise<OrganizationFeaturesDTO>}
 */
export const getAllFeaturesFromOrganization = async (organizationId) => {
  const organizationFeatures = await usecases.findOrganizationFeatures({ organizationId });

  return new OrganizationFeaturesDTO({
    features: organizationFeatures.map((organizationFeature) => new OrganizationFeatureItemDTO(organizationFeature)),
  });
};
