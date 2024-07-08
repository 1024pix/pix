import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';

/**
 * @typedef {import ('./OrganizationFeatureItemDTO.js').OrganizationFeatureItemDTO} OrganizationFeatureItemDTO
 */

export class OrganizationFeaturesDTO {
  /**
   * @param {Object} params
   * @param {Array<OrganizationFeatureItemDTO>} params.features - features containing name and params
   */
  constructor({ features = [] }) {
    this.features = features;
  }

  get hasLearnersImportFeature() {
    return this.features.some((feature) => feature.name === ORGANIZATION_FEATURE.LEARNER_IMPORT.key);
  }
}
