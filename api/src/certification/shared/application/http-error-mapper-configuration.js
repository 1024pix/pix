import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../shared/application/errors/http-errors.js';
import { configurationDomainErrorMappingConfiguration } from '../../configuration/application/http-error-mapper-configuration.js';
import { enrolmentDomainErrorMappingConfiguration } from '../../enrolment/application/http-error-mapper-configuration.js';
import { evaluationDomainErrorMappingConfiguration } from '../../evaluation/application/http-error-mapper-configuration.js';
import {
  parcoursupDomainErrorMappingConfiguration,
  resultsDomainErrorMappingConfiguration,
} from '../../results/application/http-error-mapper-configuration.js';
import { sessionDomainErrorMappingConfiguration } from '../../session-management/application/http-error-mapper-configuration.js';
import {
  CenterHabilitationError,
  CertificationCandidateNotFoundError,
  CertificationCourseUpdateError,
  CsvWithNoSessionDataError,
  InvalidCertificationReportForFinalization,
} from '../domain/errors.js';

const certificationDomainErrorMappingConfiguration = [
  {
    name: InvalidCertificationReportForFinalization.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: CertificationCourseUpdateError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: CenterHabilitationError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: CertificationCandidateNotFoundError.name,
    httpErrorFn: (error) => new NotFoundError(error.message, error.code),
  },
  {
    name: CsvWithNoSessionDataError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
];

certificationDomainErrorMappingConfiguration.push(
  ...parcoursupDomainErrorMappingConfiguration,
  ...resultsDomainErrorMappingConfiguration,
  ...enrolmentDomainErrorMappingConfiguration,
  ...sessionDomainErrorMappingConfiguration,
  ...configurationDomainErrorMappingConfiguration,
  ...evaluationDomainErrorMappingConfiguration,
);
export { certificationDomainErrorMappingConfiguration };
