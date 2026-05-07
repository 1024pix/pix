import { HttpErrors } from '../../shared/application/errors/http-errors.js';
import { InvalidAuthenticationDataError } from '../domain/errors.js';

export const maddoDomainErrorMappingConfiguration = [
  {
    name: InvalidAuthenticationDataError.name,
    httpErrorFn: (error) => new HttpErrors.BadRequestError(error.message, error.code),
  },
];
