import * as injectedFeatureRepository from '../../../../shared/infrastructure/repositories/feature-repository.js';
import * as injectedOrganizationLearnerFeatureRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-feature-repository.js';
const unlinkOrganizationLearnerFeature = async ({
  organizationLearnerId,
  featureKey,
  featureRepository = injectedFeatureRepository,
  organizationLearnerFeatureRepository = injectedOrganizationLearnerFeatureRepository,
} = {}) => {
  const feature = await featureRepository.getFeatureByKey(featureKey);

  return await organizationLearnerFeatureRepository.unlink({
    organizationLearnerId,
    featureId: feature.id,
  });
};
export { unlinkOrganizationLearnerFeature };
