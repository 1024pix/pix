import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';

const dependencies = {
  ...enrolmentRepositories,
};

import { registerCandidateParticipation } from './register-candidate-participation-service.js';

const servicesWithoutInjectedDependencies = {
  registerCandidateParticipation,
};

const services = injectDependencies(servicesWithoutInjectedDependencies, dependencies, boundedContext);

export { services };
