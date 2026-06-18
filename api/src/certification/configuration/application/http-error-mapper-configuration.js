import { HttpErrors } from '../../../shared/application/errors/http-errors.js';
import { CertificationVersionDraftAlreadyExistError, InvalidScoWhitelistError } from '../domain/errors.js';

export const configurationDomainErrorMappingConfiguration = [
  {
    name: InvalidScoWhitelistError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: CertificationVersionDraftAlreadyExistError.name,
    httpErrorFn: (error) => new HttpErrors.BadRequestError(error.message, error.code, error.meta),
  },
];
