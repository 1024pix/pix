import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as complementaryCertificationCourseRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-course-repository.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';
import * as userCertificabilityService from '../services/user-certificability-service.js';

const dependencies = {
  certificationBadgesService,
  ...enrolmentRepositories,
  complementaryCertificationCourseRepository,
};

const servicesWithoutInjectedDependencies = {
  userCertificabilityService: userCertificabilityService,
};

const services = injectDependencies(servicesWithoutInjectedDependencies, dependencies);
export { services };
