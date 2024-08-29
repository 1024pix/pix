import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as complementaryCertificationCourseRepository from '../../../../certification/complementary-certification/infrastructure/repositories/complementary-certification-course-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';
import * as userEligibilityService from '../services/user-eligibility-service.js';

const dependencies = {
  ...enrolmentRepositories,
  competenceRepository,
  complementaryCertificationCourseRepository,
  knowledgeElementRepository,
  certificationBadgesService,
};

const servicesWithoutInjectedDependencies = {
  userEligibilityService: userEligibilityService,
};

const services = injectDependencies(servicesWithoutInjectedDependencies, dependencies);
export { services };
