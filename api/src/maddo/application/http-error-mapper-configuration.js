import { BadRequestError } from '../../shared/application/errors/http-errors.js';
import { InvalidAuthenticationDataError } from '../domain/errors.js';

export const maddoDomainErrorMappingConfiguration = [
  {
    name: InvalidAuthenticationDataError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code),
  },
];
