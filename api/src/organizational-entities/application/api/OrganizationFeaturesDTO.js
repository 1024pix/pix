import { ORGANIZATION_FEATURE } from '../../../shared/constants.js';

export class OrganizationFeaturesDTO {
  constructor({ features = [] }) {
    this.features = features;
  }

  get hasLearnersImportFeature() {
    return this.features.some((feature) => feature.name === ORGANIZATION_FEATURE.LEARNER_IMPORT.key);
  }

  get hasOralizationFeature() {
    return this.features.some((feature) => feature.name === ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key);
  }
}
