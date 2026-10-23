import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as certificateRepository from '../../infrastructure/repositories/certificate-repository.js';
import { getCertificateFromCertificationCourseService } from './get-certificate-from-certification-course-services.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificateRepository} CertificateRepository
 */
const dependencies = {
  certificateRepository,
};

const servicesWithoutInjectedDependencies = {
  getCertificateFromCertificationCourseService,
};

const injectedServices = injectDependencies(servicesWithoutInjectedDependencies, dependencies, boundedContext);

export const services = {
  ...injectedServices,
};
