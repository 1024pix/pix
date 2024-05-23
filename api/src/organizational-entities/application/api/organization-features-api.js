import { usecases } from '../../domain/usecases/index.js';
import { OrganizationFeatureItemDTO } from './OrganizationFeatureItemDTO.js';

/**
 * @module OrganizationFeaturesApi
 */

/**
 * @function
 * @name getAllFeaturesFromOrganization
 *
 * @param {number} organizationId
 * @returns {Promise<Array<OrganizationFeatureItemDTO>>}
 */
export const getAllFeaturesFromOrganization = async (organizationId) => {
  const organizationFeatures = await usecases.findOrganizationFeatures({ organizationId });

  return organizationFeatures.map((organizationFeature) => new OrganizationFeatureItemDTO(organizationFeature));
};
