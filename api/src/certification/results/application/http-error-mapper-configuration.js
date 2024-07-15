import { HttpErrors } from '../../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../../shared/application/models/domain-error-mapping-configuration.js';
import { NoCertificationResultForDivision } from '../domain/errors.js';

const resultsDomainErrorMappingConfiguration = [
  {
    name: NoCertificationResultForDivision.name,
    httpErrorFn: (error) => new HttpErrors.NotFoundError(error.message, error.code, error.meta),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { resultsDomainErrorMappingConfiguration };
