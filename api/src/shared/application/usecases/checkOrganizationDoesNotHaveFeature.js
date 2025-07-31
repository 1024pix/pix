import { OrganizationDoesHaveFeatureEnabledError } from '../../../prescription/learner-management/domain/errors.js';
import * as organizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js';

const execute = async ({ organizationId, featureKey, dependencies = { organizationFeatureRepository } }) => {
  const isFeatureEnabled = await dependencies.organizationFeatureRepository.isFeatureEnabledForOrganization({
    organizationId,
    featureKey,
  });
  if (isFeatureEnabled) {
    throw new OrganizationDoesHaveFeatureEnabledError();
  }
};

export { execute };
