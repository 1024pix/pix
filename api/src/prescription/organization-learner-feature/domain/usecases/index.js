import * as featureRepository from '../../../../shared/infrastructure/repositories/feature-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationLearnerFeatureRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-feature-repository.js';
import * as organizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };

const dependencies = {
  organizationRepository,
  organizationLearnerRepository,
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
