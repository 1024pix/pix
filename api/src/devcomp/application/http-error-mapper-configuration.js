import { HttpErrors } from '../../shared/application/http-errors.js';
import { ModuleDoesNotExistError } from '../domain/errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';

const devcompDomainErrorMappingConfiguration = [
  {
    name: ModuleDoesNotExistError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
    },
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { devcompDomainErrorMappingConfiguration };
