import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';
import * as userEligibilityService from '../services/user-eligibility-service.js';

const dependencies = {
  ...enrolmentRepositories,
  competenceRepository,
  knowledgeElementRepository,
};

const servicesWithoutInjectedDependencies = {
  userEligibilityService: userEligibilityService,
};

const services = injectDependencies(servicesWithoutInjectedDependencies, dependencies);
export { services };
