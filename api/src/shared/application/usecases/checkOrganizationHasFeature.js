import * as organizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js';
import { OrganizationDoesNotHaveFeatureEnabledError } from '../../../prescription/learner-management/domain/errors.js';

const execute = async function ({ organizationId, featureKey, dependencies = { organizationFeatureRepository } }) {
  const isFeatureEnabled = await dependencies.organizationFeatureRepository.isFeatureEnabledForOrganization({
    organizationId,
    featureKey,
  });
  if (!isFeatureEnabled) throw new OrganizationDoesNotHaveFeatureEnabledError();
};

export { execute };
