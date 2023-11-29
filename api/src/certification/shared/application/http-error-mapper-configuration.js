import { HttpErrors } from '../../../shared/application/http-errors.js';
import { InvalidCertificationReportForFinalization, CertificationCourseUpdateError } from '../domain/errors.js';
import { DomainErrorMappingConfiguration } from '../../../shared/application/models/domain-error-mapping-configuration.js';

const certificationDomainErrorMappingConfiguration = [
  {
    name: InvalidCertificationReportForFinalization.name,
    httpErrorFn: (error) => {
      return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
    },
  },
  {
    name: CertificationCourseUpdateError.name,
    httpErrorFn: (error) => new HttpErrors.BadRequestError(error.message, error.code, error.meta),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { certificationDomainErrorMappingConfiguration };
