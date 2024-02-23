import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import { HttpErrors } from '../../shared/application/http-errors.js';
import { NotInProgressAssessmentError } from '../domain/school-errors.js';

const schoolDomainErrorMappingConfiguration = [
  {
    name: NotInProgressAssessmentError.name,
    httpErrorFn: (error) => new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { schoolDomainErrorMappingConfiguration };
