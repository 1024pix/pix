import { HttpErrors } from '../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import {
  ElementInstantiationError,
  ModuleDoesNotExistError,
  ModuleInstantiationError,
  PassageDoesNotExistError,
  PassageTerminatedError,
} from '../domain/errors.js';

const devcompDomainErrorMappingConfiguration = [
  {
    name: ModuleDoesNotExistError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
    },
  },
  {
    name: ModuleInstantiationError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.BadGatewayError(error.message, error.code, error.meta);
    },
  },
  {
    name: ElementInstantiationError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.BadGatewayError(error.message, error.code, error.meta);
    },
  },
  {
    name: PassageDoesNotExistError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
    },
  },
  {
    name: PassageTerminatedError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
    },
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { devcompDomainErrorMappingConfiguration };
