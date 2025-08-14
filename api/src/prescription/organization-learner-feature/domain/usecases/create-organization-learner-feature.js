import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedFeatureRepository from '../../../../shared/infrastructure/repositories/feature-repository.js';
import * as injectedOrganizationLearnerFeatureRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-feature-repository.js';

const createOrganizationLearnerFeature = withTransaction(
  async ({
    organizationLearnerId,
    featureKey,
    featureRepository = injectedFeatureRepository,
    organizationLearnerFeatureRepository = injectedOrganizationLearnerFeatureRepository,
  } = {}) => {
    const feature = await featureRepository.getFeatureByKey(featureKey);

    return await organizationLearnerFeatureRepository.create({
      organizationLearnerId,
      featureId: feature.id,
    });
  },
);
export { createOrganizationLearnerFeature };
