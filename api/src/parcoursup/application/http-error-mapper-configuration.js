import { HttpErrors } from '../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import { MoreThanOneMatchingCertificationError } from '../domain/errors.js';

export const parcoursupDomainErrorMappingConfiguration = [
  {
    name: MoreThanOneMatchingCertificationError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));
