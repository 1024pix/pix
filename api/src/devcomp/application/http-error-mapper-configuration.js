import {
  BadGatewayError,
  PreconditionFailedError,
  UnprocessableEntityError,
} from '../../shared/application/errors/http-errors.js';
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
      return new UnprocessableEntityError(error.message, error.code, error.meta);
    },
  },
  {
    name: ModuleInstantiationError.name,
    httpErrorFn: (error) => {
      return new BadGatewayError(error.message, error.code, error.meta);
    },
  },
  {
    name: ElementInstantiationError.name,
    httpErrorFn: (error) => {
      return new BadGatewayError(error.message, error.code, error.meta);
    },
  },
  {
    name: PassageDoesNotExistError.name,
    httpErrorFn: (error) => {
      return new UnprocessableEntityError(error.message, error.code, error.meta);
    },
  },
  {
    name: PassageTerminatedError.name,
    httpErrorFn: (error) => {
      return new PreconditionFailedError(error.message, error.code, error.meta);
    },
  },
];

export { devcompDomainErrorMappingConfiguration };
