import * as featureRepository from '../../../../shared/infrastructure/repositories/feature-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationLearnerFeatureRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-feature-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };

const dependencies = {
  organizationLearnerFeatureRepository,
  featureRepository,
};

import { createOrganizationLearnerFeature } from './create-organization-learner-feature.js';
import { unlinkOrganizationLearnerFeature } from './unlink-organization-learner-feature.js';

const usecasesWithoutInjectedDependencies = {
  createOrganizationLearnerFeature,
  unlinkOrganizationLearnerFeature,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
